import React, { useState, useEffect } from 'react'
import { 
    Heading,
    Text,
    Button,
    Box,
    Flex,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    Spinner,
    RadioGroup,
    Stack,
    Radio,
    Input,
    Checkbox,
    CheckboxGroup
} from '@chakra-ui/react'

import {
    Link
  } from "react-router-dom";

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";

const Landing = () => {

    const [page, setPage] = useState(1);
    const [table, setTable] = useState(null);
    const [total_pages, setTotal_pages] = useState(5);

    const [checkedVS, setCheckedVS] = useState(["NONE", "PARTIAL", "COMPLETE"])
    const [checkedMV, setCheckedMV] = useState(["FAILED", "PENDING", "DONE"])
    const [checkedAV, setCheckedAV] = useState(["FAILED", "PENDING", "DONE"])

    const [searchName, setSearchName] = useState(null);
    const [searchEmail, setSearchEmail] = useState(null);
    const [batch, setBatch] = useState(["2020", "2019", "2018"]);

    const [startDate, setStartDate] = useState(new Date("2021/09/01"));
    const [endDate, setEndDate] = useState(new Date("2021/09/25"));

    const handleNameChange = (event) => setSearchName(event.target.value)
    const handleEmailChange = (event) => setSearchEmail(event.target.value)

    const getData = () => {
        fetch('https://vaccination.bits-dvm.org/api/admin/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                "page" : page,
                "filters" : {
                    "name" : cleanSearchString(searchName),
                    "email" : cleanSearchString(searchEmail),
                    "auto_verification" : checkedAV,
                    "manual_verification" : checkedMV,
                    "vaccination_status" : checkedVS,
                },
                "between" : {
                    "start" : startDate,
                    "end" : endDate
                },
                "batch" : batch
            })
        }).then(response => 
            response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            if(res.data){
                console.log(res.data)
                setTable(res.data.data)
                setTotal_pages(res.data.total_pages)
            } else {
                alert("ERROR RETRIEVING CONTENT.");
            }
    }))}

    useEffect(() => {
        getData();
    }, [])

    const previousPage = () => {
        if ((page - 1) >= 1) {
            setPage(page - 1);
            getData();
        }
    }

    const cleanSearchString = (searchString) => {
        if (searchString === "") return null;
        else return searchString;
    }

    const nextPage = () => {
        if ((page + 1) <= total_pages) {
            setPage(page + 1);
            getData();
        }
    }

    // date cleaner function
    const cleanDate = (dateTime) => {
        // ISO: 2002-08-09T10:33:30.000Z

        const date = dateTime.substring(0, 10)
        const time = dateTime.substring(11, 16)

        const month = date.substring(5,7)
        const year = date.substring(0,4)
        const day = date.substring(8,10)

        const months = [
            ["January", "01"],
            ["Feburary", "02"],
            ["March", "03"],
            ["April", "04"],
            ["May", "05"],
            ["June", "06"],
            ["July", "07"],
            ["August", "08"],
            ["September", "09"],
            ["October", "10"],
            ["November", "11"],
            ["December", "12"],
        ]

        let monthName = "";
        for (let i = 0; i < 12; i++) {
            if (month === months[i][1]) monthName = months[i][0]
        }

        return (time+" | "+day+" "+monthName+", "+year)
    }



    return (
        <>
        
        { table ? 
        <> 
        <Flex 
            width="100%" 
            mt="20px"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
        >
            <Flex 
                flexDir="row"
                flexWrap="wrap"
                alignItems="center"
                justifyContent="space-between"
                width="80vw"
                mb="20px"
                mt="10px"
            >
                 <Heading
                    fontFamily="Helvetica"
                    fontSize="24px"
                    fontWeight="bold"
                    color="#141B41"
                >BITS Vaccine Portal Admin</Heading>

                
            </Flex>

        <Flex flexDir="column" width="90vw" flexWrap="wrap" alignItems="center" justifyContent="center">
            
            <Flex flexDir="column" width="80vw" bg="#F5F5F5" padding="10px" position="sticky" borderRadius="20px" flexWrap="wrap">
                <Flex flexDir="row" flexWrap="wrap" justifyContent="space-between">
                    <Flex flexDir="column" padding="10px">
                        <Text fontWeight="bold">Vaccination Status</Text>
                        <CheckboxGroup
                            onChange={setCheckedVS}
                            value={checkedVS}>
                            <Stack direction="row" flexWrap="wrap">
                                <Checkbox value="NONE">None</Checkbox>
                                <Checkbox value="PARTIAL">Partial</Checkbox>
                                <Checkbox value="COMPLETE">Complete</Checkbox>
                            </Stack>
                            {/* <Text>{checkedVS}</Text> */}
                        </CheckboxGroup>
                    </Flex>

                    <Flex flexDir="column" padding="10px">
                        <Text fontWeight="bold">Auto Verification</Text>
                        <CheckboxGroup
                        onChange={setCheckedAV}
                        value={checkedAV}>
                            <Stack direction="row" flexWrap="wrap">
                                <Checkbox value="FAILED">Failed</Checkbox>
                                <Checkbox value="PENDING">Pending</Checkbox>
                                <Checkbox value="DONE">Done</Checkbox>
                            </Stack>
                            {/* <Text>{checkedAV}</Text> */}
                            </CheckboxGroup>
                    </Flex>

                    <Flex flexDir="column" padding="10px">
                        <Text fontWeight="bold">Manual Verification</Text>
                        <CheckboxGroup 
                        onChange={setCheckedMV}
                        value={checkedMV}>
                            <Stack direction="row" flexWrap="wrap">
                                <Checkbox value="FAILED">Failed</Checkbox>
                                <Checkbox value="PENDING">Pending</Checkbox>
                                <Checkbox value="DONE">Done</Checkbox>
                            </Stack>
                            {/* <Text>{checkedMV}</Text> */}
                            </CheckboxGroup>
                    </Flex>

                    <Flex flexDir="column" padding="10px">
                        <Text fontWeight="bold">Batch</Text>
                        <CheckboxGroup 
                        onChange={setBatch}
                        value={batch}>
                            <Stack direction="row" flexWrap="wrap">
                                <Checkbox value="2020">2020</Checkbox>
                                <Checkbox value="2019">2019</Checkbox>
                                <Checkbox value="2018">2018</Checkbox>
                            </Stack>
                            </CheckboxGroup>
                    </Flex>

                    
                    
                    <Flex flexDir="column" padding="10px">
                        <Text fontWeight="bold">Start Date</Text>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                        />
                        <Text mt="5px" fontWeight="bold">End Date</Text>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                        />
                    </Flex>

                    <Flex flexDir="column" padding="10px">
                        <Text mt="5px" fontWeight="bold">Search by Name</Text>
                        <Input
                            value={searchName}
                            onChange={handleNameChange}
                            placeholder="Enter name here"
                            size="md"
                        />
                    </Flex>

                    <Flex flexDir="column" padding="10px">
                        <Text mt="5px" fontWeight="bold">Search by Email</Text>
                        <Input
                            value={searchEmail}
                            onChange={handleEmailChange}
                            placeholder="f20XXABCD@bits-pilani.ac.in"
                            size="md"
                        />
                    </Flex>

                    <Button width="200px" m="20px" onClick={getData} colorScheme="blue">Filter</Button>
                </Flex>


            </Flex>
            
        

            <Flex flexDir="row" m="20px">
                    <Button 
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={previousPage}
                        width="80px"
                    >Previous</Button>
                    <Text 
                        mr="10px"
                        ml="10px"
                        fontSize="20px"
                        fontWeight="bold"
                    >{ page } of { total_pages }</Text>
                    <Button
                        colorScheme="blue"
                        onClick={nextPage}
                        variant="outline"
                        width="80px"
                        size="sm"
                    >Next</Button>
                </Flex>
            
            
            { table ?  
            <Box width="90%" overflowX="scroll">
            <Table 
                variant="simple" 
                size="sm" 
                width="80vw" 
                mb="50px" 
                mt="20px"
            >
                <TableCaption>BITS Students' Vaccination Status</TableCaption>

                <Thead>
                    <Tr>
                        <Th>OVERALL STATUS</Th>
                        <Th>NAME</Th>
                        <Th>EMAIL</Th>
                        <Th>VACCINATION STATUS</Th>
                        <Th>AUTO VERIFICATION</Th>
                        <Th>MANUAL VERIFICATION</Th>
                        <Th>REPORTING DATE</Th>
                        <Th>CITY</Th>
                        <Th>CONTAINMENT ZONE</Th>
                        <Th>VIEW MORE</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    { (table).map((student, index) => (
                    <Tr>
                        <Td>
                            { student.overall_status ? 
                            <Text color="green" fontWeight="bold">Verified</Text> :
                            <Text color="red" fontWeight="bold">Unverified</Text> }
                        </Td>

                        <Td>
                            <Text color="black" fontWeight="bold">{ student.name }</Text>
                        </Td>

                        <Td>
                            <Text color="grey" fontWeight="bold">{ student.email }</Text>
                        </Td>

                        <Td>
                            <Text color="grey" fontWeight="bold">{ student.vaccination_status }</Text>
                        </Td>
                        
                        <Td>
                            <Text color="grey" fontWeight="bold">{ student.auto_verification }</Text>
                        </Td>

                        <Td>
                            <Text color="grey" fontWeight="bold">{ student.manual_verification }</Text>
                        </Td>

                        <Td>
                            <Text color="grey" fontWeight="bold">{ cleanDate(student.arrival_date) }</Text>
                        </Td>

                        <Td>
                            <Text color="grey" fontWeight="bold">{ student.city }</Text>
                        </Td>

                        { student.is_containment_zone ? 
                        <Td>
                            <Text color="red" fontWeight="bold">YES</Text>
                        </Td> :
                        <Td>
                            <Text color="green" fontWeight="bold">NO</Text>
                        </Td>}
                        

                        <Link to={"/student/"+student._id}>
                            <Button size="sm" mt="10px">View More</Button>
                        </Link>
                    </Tr>
                    ))}
                </Tbody>

                <Tfoot>
                    <Tr>
                        <Th>OVERALL STATUS</Th>
                        <Th>NAME</Th>
                        <Th>EMAIL</Th>
                        <Th>VACCINATION STATUS</Th>
                        <Th>AUTO VERIFICATION</Th>
                        <Th>MANUAL VERIFICATION</Th>
                        <Th>REPORTING DATE</Th>
                        <Th>CITY</Th>
                        <Th>CONTAINMENT ZONE</Th>
                        <Th>VIEW MORE</Th>
                    </Tr>
                </Tfoot>
            </Table></Box>
         : <Spinner />}
         </Flex>
        </Flex>
        </> : <Spinner />}</>
    )
}

export default Landing;
