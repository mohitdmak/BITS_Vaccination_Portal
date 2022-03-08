import { React, useState, useEffect } from 'react'

import {
    Flex,
    Box,
    Text,
    Heading,
    Button,
} from '@chakra-ui/react'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
    Link,
  } from "react-router-dom";

// added by --- Mohit
// Setting appropriate host 
let host;
if (process.env.REACT_APP_CLIENT_ENV === 'development') {
    host = 'http://localhost:1370';
} else if (process.env.REACT_APP_CLIENT_ENV === 'production') {
    //host = 'https://vaccination.bits-dvm.org';
    host = 'http://40.88.13.106';
}

const Login = (props) => {
    const [batches, setBatches] = useState([]);

    const getBatch = () => {
        fetch(host + '/api/admin/allow', {
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
                if (res.data) {
                    setBatches(res.data.batch)
                } else {
                    console.log("ERROR RETRIEVING CONTENT.");
                }
            }))
    }

    useEffect(() => {
        getBatch();
    }, [])

    return (
        <>
            <Flex alignItems="center" flexDir="column" m="50px" >
                <Flex width="80vw" alignItems="center" flexDir="column" justifyContent="center">
                    <Heading fontSize="24px" textAlign="center" fontWeight="bold" mt="70px" mb="5px">BITS Apogee Vaccination Status Portal</Heading>
                    <Text mt="0px" fontWeight="bold" mb="20px" fontSize="20px" color="gray.600">An initiative by SWD</Text>

                    <Text mt="30px" width={["300px", "300px", "400px", "400px", "400px"]} textAlign="center" color="grey">Please note, only students from the following batches will be currently allowed access:</Text>
                    <Text mt="10px" width={["300px", "300px", "400px", "400px", "400px"]} textAlign="center" fontWeight="bold" color="green">{batches.toString()}</Text>
                    {/* <Text mt="10px" width={["300px", "300px", "400px", "400px", "400px"]} textAlign="center" color="red.400">PS2/off-campus thesis students are not allowed.</Text> */}

                    <Button
                        padding="20px"
                        mt="30px"
                        colorScheme="blue"
                        onClick={() => window.open(host + "/api/auth", "_parent")}
                    >Login with BITS Mail</Button>

                    <Box pt="10px" pb="10px" pl="10px" pr="10px" bg="gray.100" width={['90vw', '90vw', '60vw']} mt="40px" borderRadius="5px" display="flex" flexDir="column">
                        <Text align="center" fontWeight="medium" fontSize="15px" color="gray.600">For details about Campus Reopening, please visit<br />
                        <a href='https://navinbits.blogspot.com/' style={{color:"black", fontWeight: "700"}}>
                            Campus Reopening Details Page <ExternalLinkIcon mx='2px' />
                        </a></Text>
                    </Box>



                    <Link to="/devs">
                        <Text color="grey" mt="45px">Meet the Developers | Powered by <span style={{"font-weight": "600"}}>DVM</span></Text>
                    </Link>
                </Flex>
            </Flex>
        </>
    )
}

export default Login;
