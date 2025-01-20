import React, { useState } from 'react';
// import { FixedSizeList as List } from 'react-window';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Card, CardContent
} from '@mui/material';
import './Table.css';

interface CourseData {
    id: string;
    value: {
        class_number: string;
        course_dept: string;
        course_code: string;
        class_section: string;
        course_title: string;
        school: string;
        career: string;
        class_type: string;
        credit_hours: string;
        grading_basis: string;
        consent: string;
        term_year: number;
        term_season: string;
        session: string;
        dates: string;
        requirements: string;
        description: string | null;
        notes: string | null;
        status: string;
        capacity: number;
        enrolled: number;
        wl_capacity: number;
        wl_occupied: number;
        attributes: string[] | null;
        meeting_days: string[];
        meeting_times: string[];
        meeting_dates: string[];
        instructors: string[];
    };
}

// useful inside: description, consent, hours, class type, requirements, notes, attributes
const CompactTable: React.FC<{ data: CourseData[] }> = ({ data }) => {

    const [open, setOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseData>();

    // Handle row click to open dialog
    const handleRowClick = (course: any) => {
        setSelectedCourse(course);
        setOpen(true);
    };

    // Handle closing of dialog
    const handleCloseDialog = () => {
        setOpen(false);
        // setSelectedCourse();
    };

    return (
        <div>
            <TableContainer component={Paper} style={{ minHeight: "400px", width: "100%", padding: 0, boxShadow: "none" }}>
                <Table
                    size="small"
                    aria-label="compact table"
                    stickyHeader
                    style={{ width: "100%", tableLayout: "fixed" }}
                >
                    {/* Table Header */}
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ width: "20%" }}>Code</TableCell>
                            <TableCell style={{ width: "30%" }}>Title</TableCell>
                            <TableCell style={{ width: "20%" }}>Instructors</TableCell>
                            <TableCell style={{ width: "15%" }}>Enrolled/Capacity</TableCell>
                            <TableCell style={{ width: "15%" }}>Meeting Time</TableCell>
                        </TableRow>
                    </TableHead>

                    
                    <TableBody>
                        {data.map((row: CourseData) => (
                            <TableRow key={row.id} hover onClick={() => handleRowClick(row)}>
                                <TableCell>
                                    {row.value.course_dept} {row.value.course_code}-{row.value.class_section}
                                </TableCell>

                                <TableCell>
                                    {row.value.course_title}
                                </TableCell>

                                <TableCell>
                                    {row.value.instructors.join(", ")}
                                </TableCell>

                                <TableCell>
                                    {row.value.enrolled}/{row.value.capacity} ({row.value.status})
                                </TableCell>

                                <TableCell>
                                    {row.value.meeting_days.map((day, index) => (
                                        <span key={index}>
                                            {day}
                                            {day !== "TBA" && ` ${row.value.meeting_times[index]}`}
                                            {index < row.value.meeting_days.length - 1 && ", "}
                                        </span>
                                    ))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={open}
                onClose={handleCloseDialog}
                fullWidth  // Makes the dialog take up full width
                PaperProps={{
                    style: {
                        width: "70%",  // Set the width to 80% of the screen
                        height: "85%",  // Set the height to 80% of the screen
                        margin: "auto",  // Centers the dialog
                        maxHeight: "90vh",  // Prevents the dialog from getting too tall
                    },
                }}
            >
                <DialogTitle style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
                    {selectedCourse?.value?.course_dept} {selectedCourse?.value?.course_code}-{selectedCourse?.value?.class_section}: {selectedCourse?.value?.course_title}
                    <span style={{ fontSize: "1.5rem", fontWeight: "normal", color: "#666" }}>
                        {" "}({selectedCourse?.value?.term_season} {selectedCourse?.value?.term_year})
                    </span>
                </DialogTitle>
                <DialogContent>
                    <Card style={{ padding: "20px", margin: "0 auto", height: "100%", boxShadow: "true" }}>
                        <CardContent>
                            {selectedCourse?.value?.description}

                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "10px" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: "bold", width: "50%" }}>Instructors:</td>
                                        <td>{selectedCourse?.value?.instructors.join(", ")}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: "bold" }}>Enrolled / Capacity:</td>
                                        <td>{selectedCourse?.value?.enrolled} / {selectedCourse?.value?.capacity} ({selectedCourse?.value?.status})</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Meeting Time:</td>
                                        <td style={{ verticalAlign: "top" }}>
                                            {selectedCourse?.value?.meeting_days.map((day, index) => {
                                                const time = selectedCourse?.value?.meeting_times[index];
                                                const date = selectedCourse?.value?.meeting_dates[index];

                                                // Skip if the day is "TBA"
                                                if (day === "TBA") {
                                                    return (
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            <span style={{ fontWeight: "bold", marginRight: "10px" }}>TBA</span>
                                                        </div>
                                                    )
                                                }

                                                // Conditionally display the date only if meeting_times has more than 1 entry
                                                const showDate = selectedCourse?.value?.meeting_times.length > 1;

                                                return (
                                                    <div key={index} style={{ display: "flex", flexDirection: "column", marginBottom: "5px" }}>
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            <span style={{ fontWeight: "bold", marginRight: "10px" }}>{day}</span>
                                                            <span>{time}</span>
                                                        </div>
                                                        <div style={{ color: "#666" }}>
                                                            {showDate && <span> <em>{date}</em></span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};

export default CompactTable;