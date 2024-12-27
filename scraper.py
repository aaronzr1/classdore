# implementation details:
    # we search 3-digit codes from 000 to 999
    # this will give some duplicate results, ex. 3140 popping up in both "140" and "314"
    # we assume that no search results exceed 300 (this is max number of records retreivable at a time)
    # this means we have to check for a maximum of 6 pages

import requests
from bs4 import BeautifulSoup
import re

def findTotalRecords(soup):

    """
    A simple helper function to find total records that pop up for a given search result.

    Parameters:
    soup (BeautifulSoup object): 

    Returns:
    int: total number of records
    """

    # find "<script>"" tag containing "totalRecords"
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

    # use same session to allow page switching
    session = requests.Session()

    # extract response and content from given url
    response = session.get(url)
    content = response.content
    
    # extract total records from given search result
    total_records = findTotalRecords(BeautifulSoup(content, "lxml"))
    if total_records == 300: print("NOTE: MAX RECORD COUNT HIT")

    # calculate additional pages to check: 0-50 records means 0, 51-100 means 1, ...
    additional_pages = max(0, total_records // 50 - (not (total_records % 50))) # note 0 gives -1
    
    # append content from additional pages
    pageUrl = "https://more.app.vanderbilt.edu/more/SearchClassesExecute!switchPage.action?pageNum="
    for i in range(additional_pages):
        add_response = session.get(pageUrl + str(i + 1))
        content += add_response.content
    
    soup = BeautifulSoup(content, "lxml")
    return soup
    

# subject-specific url:
"""
url = "https://more.app.vanderbilt.edu/more/SearchClassesExecute!search.action?searchCriteria.subjectAreaCodes=CS"
"""

# finding all links on the page
"""
links = soup.find_all("a")
for link in links:
    print(link.get("href"))
"""