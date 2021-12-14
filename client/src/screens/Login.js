import { React, useState, useEffect } from 'react'

import {
    Flex,
    Box,
    Text,
    Heading,
    Button
} from '@chakra-ui/react'

import {
    Link,
  } from "react-router-dom";

const Login = (props) => {
    const [batches, setBatches] = useState([]);

    const getBatch = () => {
        fetch('https://vaccination.bits-dvm.org/api/admin/allow', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => 
            response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            if(res.data){
               setBatches(res.data.batch)
            } else {
                console.log("ERROR RETRIEVING CONTENT.");
            }
    }))}

    useEffect(() => {
        getBatch();
    }, [])

    return (
        <>
        <Flex alignItems="center" flexDir="column" m="50px" >
            <Flex width="80vw" alignItems="center" flexDir="column" justifyContent="center">
                <Heading fontSize="24px" textAlign="center" fontWeight="bold" mt="70px" mb="5px">BITS Vaccination Status Portal</Heading>
                <Text mt="0px" fontWeight="bold" mb="20px" fontSize="20px" color="gray.600">An initiative by SWD</Text>

                <Text mt="30px" width={["300px", "300px", "400px", "400px", "400px"]} textAlign="center" color="grey">Please note, only students from the following batches will be currently allowed access:</Text>
                <Text mt="10px" width={["300px", "300px", "400px", "400px", "400px"]} textAlign="center" fontWeight="bold" color="green">{batches.toString()}</Text>
                <Text mt="10px" width={["300px", "300px", "400px", "400px", "400px"]} textAlign="center" color="red.400">PS2/off-campus thesis students are not allowed.</Text>

                <Button 
                    padding="20px"
                    mt="30px"
                    colorScheme="blue"
                    onClick={() => window.open("https://vaccination.bits-dvm.org/api/auth", "_parent")}
                >Login with BITS Mail</Button>

                <Box bg="gray.100" width="60vw" mt="40px" borderRadius="20px" display="flex" flexDir="column">
                   <Text p="20px" pb="5px" textAlign="center" fontWeight="bold" color="black">Message from the Chief Warden</Text>
                   <Text p="20px" pt="5px" textAlign="center" color="gray">1. Negative RT-PCR reports of all the people coming inside campus (Driver/Parents/Visitors/Students) is compulsory.</Text>
                   <Text p="20px" pt="3px" textAlign="center" color="gray">2. Parents will be allowed to enter only once, for max 3 hours.</Text>
                   <Text p="20px" pt="3px" textAlign="center" color="gray">3. Hostel allocation will not be done on a first-come first-serve basis, you will be given a preference to make your wing. The rest of the details will be communicated to you shortly — please cooperate and refrain from sending unneccessary emails.</Text>
                </Box>

                

                <Link to="/devs">
                    <Text color="grey"mt="45px">Meet the Developers | Powered by DVM</Text>
                </Link>
            </Flex>
        </Flex>
        </>
    )
}

export default Login;
