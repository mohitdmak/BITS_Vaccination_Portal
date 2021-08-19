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
    Checkbox,
    CheckboxGroup
} from '@chakra-ui/react'
import {
    Link
  } from "react-router-dom";

const Landing = () => {

    const [page, setPage] = useState(1);
    const [table, setTable] = useState(null);
    const [total_pages, setTotal_pages] = useState(5);

    const [checkedVS, setCheckedVS] = useState(["NONE", "PARTIAL", "COMPLETE"])
    const [checkedMV, setCheckedMV] = useState(["FAILED", "PENDING", "DONE"])
    const [checkedAV, setCheckedAV] = useState(["FAILED", "PENDING", "DONE"])

    const getData = () => {
        fetch('https://vaccination.bits-dvm.org/cms/api/admin/students', { // Your POST endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "page" : page,
                "filters" : {
                    "auto_verification" : checkedAV,
                    "manual_verification" : checkedMV,
                    "vaccination_status" : checkedVS,
                }
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

    const nextPage = () => {
        if ((page + 1) <= total_pages) {
            setPage(page + 1);
            getData();
        }
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

                <Flex flexDir="row">
                    <Button 
                        size="sm"
                        colorScheme="blue"
                        onClick={previousPage}
                        width="80px"
                    >Previous</Button>
                    <Text 
                        mr="10px"
                        ml="10px"
                        fontSize="24px"
                        fontWeight="bold"
                    >{ page } of { total_pages }</Text>
                    <Button
                        colorScheme="blue"
                        onClick={nextPage}
                        width="80px"
                        size="sm"
                    >Next</Button>
                </Flex>
            </Flex>

        <Flex flexDir="row" width="90vw" flexWrap="wrap" >
            <Flex flexDir="column" width="20vw" bg="#F5F5F5" padding="10px" borderRadius="20px">
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
                <Button mt="10px" onClick={getData} colorScheme="blue">Filter</Button>
            </Flex>
        
            

            { table ?  
            <Table 
                variant="simple" 
                size="md" 
                width="70vw" 
                mb="50px" 
                mt="20px"
                overflow="scroll"
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

                        <Link to={"/"+student._id}>
                            <Button mt="15px">View More</Button>
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
                        <Th>VIEW MORE</Th>
                    </Tr>
                </Tfoot>
            </Table>
         : <Spinner />}
         </Flex>
        </Flex>
        </> : <Spinner />}</>
    )
}

export default Landing;