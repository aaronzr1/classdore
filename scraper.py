import requests, re, json, argparse
from bs4 import BeautifulSoup
from tqdm import tqdm

def findTotalRecords(soup):

    """
    A simple helper function to find total records that pop up for a given search result.

    Parameters:
    soup (BeautifulSoup object): 

    Returns:
    int: total number of records
    """

    script_tag = soup.find('script', string=re.compile('totalRecords'))

    total_records = 0
    if script_tag:
        match = re.search(r'totalRecords\s*:\s*(\d+)', script_tag.string)
        if match: total_records = int(match.group(1))
    
    return total_records

def fetch(url):

    """
    A simple fetch function to extract data from a url (with search keywords encoded).

    Parameters:
    url (string): url to extract data from

    Returns:
    BeautifulSoup object: extracted info from url
    """

    session = requests.Session() # use same session to allow page switching

    response = session.get(url)
    content = response.content
    
    total_records = findTotalRecords(BeautifulSoup(content, "lxml"))
    if total_records == 300: print("NOTE: MAX RECORD COUNT HIT WITH URL", url)

    # 0-50 records means no additional pages, 51-100 means 1 additional page, etc.
    additional_pages = max(0, total_records // 50 - (not (total_records % 50))) # note 0 gives -1
    pageUrl = "https://more.app.vanderbilt.edu/more/SearchClassesExecute!switchPage.action?pageNum="

    for i in range(additional_pages):
        add_response = session.get(pageUrl + str(i + 2))
        content += add_response.content
    
    soup = BeautifulSoup(content, "lxml")
    return soup

def scrape_listings_for_keyword(soup):
    # find all <td> with "classNumber_" in id
    listing_elements = soup.find_all('td', id=lambda x: x and x.startswith("classNumber_"))

    new_data = []
    for listing in listing_elements:
        onclick_text = listing.get('onclick', '')
        
        class_number, term_code = None, None
        if "classNumber" in onclick_text and "termCode" in onclick_text:
            class_number = onclick_text.split("classNumber : '")[1].split("'")[0]
            term_code = onclick_text.split("termCode : '")[1].split("'")[0]
        
        if class_number and term_code:
            new_data.append({'classNumber': class_number, 'termCode': term_code})
    
    return new_data

def update_course_listings(new_data):

    # load existing data
    try:
        with open('data/course_listings.json', 'r') as file:
            existing_data = json.load(file)
    except FileNotFoundError:
        existing_data = []

    # duplicate detection
    existing_set = set((entry["classNumber"], entry["termCode"]) for entry in existing_data)

    # add unique entries
    for entry in new_data:
        pair = (entry["classNumber"], entry["termCode"])
        if pair not in existing_set:
            existing_data.append(entry)
            existing_set.add(pair)

    with open('data/course_listings.json', 'w') as file:
        json.dump(existing_data, file, indent=4)

def iterate_keywords():
    base_url = "https://more.app.vanderbilt.edu/more/SearchClassesExecute!search.action?keywords="

    edges = [100, 110, 385, 799, 850, 899] # keywords that have over 300 entries (gets truncated)
    # skip *999 series since it's mostly phd dissertation research (7999, 8999, 9999 have 300+ each)
    for i in tqdm(range(999), desc="Generating course listings", unit="keyword"):

        if i in edges:
            addons = [str(j) + f"{i:03d}" for j in range(10)]
        else:
            addons = [f"{i:03d}"]

        for addon in addons:
            url = base_url + addon

            response = requests.get(url)
            content = response.content

            total_records = findTotalRecords(BeautifulSoup(content, "lxml"))

            try:
                soup = fetch(url)
                new_data = scrape_listings_for_keyword(soup)
                update_course_listings(new_data)
            except:
                print(f"error scraping listings for keyword '{addon}'")

def extract_class_details(soup):
    header = soup.find("h1").text.strip()
    parts = header.strip().split(":", 1)
    dept_code, course_title = parts[0].split("-"), parts[1].strip()

    course_dept, course_code, class_section = dept_code[0], dept_code[1], dept_code[2].strip()
    return course_dept, course_code, class_section, course_title

def extract_other_details(soup):
    details_table = soup.find("table", class_="nameValueTable")
    
    # left side details
    school = details_table.find("td", string="School:").find_next_sibling("td").text.strip()
    career = details_table.find("td", string="Career:").find_next_sibling("td").text.strip()
    class_type = details_table.find("td", string="Component:").find_next_sibling("td").text.strip()
    credit_hours = details_table.find("td", string="Hours:").find_next_sibling("td").text.strip()
    grading_basis = details_table.find("td", string="Grading Basis:").find_next_sibling("td").text.strip()
    consent = details_table.find("td", string="Consent:").find_next_sibling("td").text.strip()

    # right side details
    term = details_table.find("td", string="Term:").find_next_sibling("td").text.strip()
    term_year, term_season = term.split(" ")
    session = details_table.find("td", string="Session:").find_next_sibling("td").text.strip()
    dates = details_table.find("td", string="Session Dates:").find_next_sibling("td").text.strip()
    requirements = details_table.find("td", string="Requirement(s):").find_next_sibling("td").text.strip()

    return school, career, class_type, credit_hours, grading_basis, consent, term_year, term_season, session, dates, requirements

def extract_desc_and_notes(soup):
    description_div = soup.find("div", class_="detailHeader", string=lambda text: "Description" in text)
    description = description_div.find_next_sibling("div").text.strip() if description_div else None

    notes_div = soup.find("div", class_="detailHeader", string=lambda text: "Notes" in text)
    notes = notes_div.find_next_sibling("div").text.strip() if notes_div else None

    return description, notes

def extract_availability(soup):
    availability_table = soup.find("table", class_="availabilityNameValueTable")
    status = soup.find("div", class_="availabiltyIndicator").find("span").text.strip()
    capacity = availability_table.find("td", string="Class Capacity:").find_next_sibling("td").text.strip()
    enrolled = availability_table.find("td", string="Total Enrolled:").find_next_sibling("td").text.strip()
    wl_capacity = availability_table.find("td", string="Wait List Capacity:").find_next_sibling("td").text.strip()
    wl_occupied = availability_table.find("td", string="Total on Wait List:").find_next_sibling("td").text.strip()

    return status, capacity, enrolled, wl_capacity, wl_occupied

def extract_attributes(soup):
    attributes_div = soup.find("div", class_="detailHeader", string=lambda text: "Attributes" in text)
    attributes = [item.text.strip() for item in attributes_div.find_next_sibling("div").find_all("div", class_="listItem")] if attributes_div else None
    return attributes

def extract_meetings_and_instructors(soup):
    meeting_tables = soup.find_all("table", class_="meetingPatternTable")

    meeting_days = []
    meeting_times = []
    meeting_dates = []
    instructors = set()

    for meeting_table in meeting_tables:
        for row in meeting_table.find_all("tr")[1:]:
            columns = row.find_all("td")
            if len(columns) < 4: continue # probably bad data
            meeting_days.append(columns[0].text.strip())
            meeting_times.append(columns[1].text.strip())
            meeting_dates.append(columns[3].text.strip())
            for inst in columns[4].find_all("div"): instructors.add(inst.text.strip())

    return meeting_days, meeting_times, meeting_dates, list(instructors)

def scrape_course_details(soup):

    class_number = soup.find("div", class_="classNumber").text.split(":")[1].strip()
    course_dept, course_code, class_section, course_title = extract_class_details(soup)
    school, career, class_type, credit_hours, grading_basis, consent, term_year, term_season, session, dates, requirements = extract_other_details(soup)
    description, notes = extract_desc_and_notes(soup)
    status, capacity, enrolled, wl_capacity, wl_occupied = extract_availability(soup)
    attributes = extract_attributes(soup)
    meeting_days, meeting_times, meeting_dates, instructors = extract_meetings_and_instructors(soup)
    
    current_data = {
        "class_number": class_number,
        "course_dept": course_dept,
        "course_code": course_code,
        "class_section": class_section,
        "course_title": course_title,
        "school": school,
        "career": career,
        "class_type": class_type,
        "credit_hours": credit_hours,
        "grading_basis": grading_basis,
        "consent": consent,
        "term_year": term_year,
        "term_season": term_season,
        "session": session,
        "dates": dates,
        "requirements": requirements,
        "description": description,
        "notes": notes,
        'status': status,
        'capacity': capacity,
        'enrolled': enrolled,
        'wl_capacity': wl_capacity,
        'wl_occupied': wl_occupied,
        "attributes": attributes,
        "meeting_days": meeting_days,
        "meeting_times": meeting_times, 
        "meeting_dates": meeting_dates, 
        "instructors": instructors
    }

    return current_data

def update_course_details(new_data):

    # load existing data
    try:
        with open('data/data.json', 'r') as file:
            existing_data = json.load(file)
    except FileNotFoundError:
        existing_data = []
    
    # convert to dict for easy saving
    existing_data_dict = {entry["class_number"]: entry for entry in existing_data}
    class_number = new_data["class_number"]
    existing_data_dict[class_number] = new_data # update or append

    # back to list for saving
    updated_data = list(existing_data_dict.values())
    
    with open('data/data.json', 'w') as file:
        json.dump(updated_data, file, indent=4)

def iterate_listings():
    with open('data/course_listings.json', 'r') as file:
        data = json.load(file)

    # data =[{
    #     "classNumber": "2642",
    #     "termCode": "1055"
    # }]
    
    base_url = "https://more.app.vanderbilt.edu/more/GetClassSectionDetail.action?classNumber="
    for listing in tqdm(data, desc="Scraping data", unit="listing"):
        url = base_url + f"{listing['classNumber']}&termCode={listing['termCode']}"
        try:
            soup = fetch(url)
            print(url)
            current_data = scrape_course_details(soup)
            update_course_details(current_data)
        except:
            print(f"error scraping details for listing '{listing}'")

def main():
    parser = argparse.ArgumentParser(description="Scrape course listings and details.")
    
    parser.add_argument('-l', '--listings', action='store_true', help="Scrape course listings only")
    parser.add_argument('-d', '--details', action='store_true', help="Scrape course details only")
    
    args = parser.parse_args()

    # If neither flag is passed, run both functions
    if not (args.listings or args.details):
        iterate_keywords()
        iterate_listings()
    else:
        if args.listings:
            iterate_keywords()

        if args.details:
            iterate_listings()


if __name__ == "__main__":
    main()