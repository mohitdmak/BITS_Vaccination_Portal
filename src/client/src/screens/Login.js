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
        <Flex alignItems="center" flexDir="column" >
            <Flex width="80vw" alignItems="center" flexDir="column" justifyContent="center">
                <Heading fontSize="24px" textAlign="center" fontWeight="bold" mt="200px" mb="20px">BITS Vaccination Status Portal</Heading>
                <Button 
                    padding="20px"
                    onClick={() => window.open("https://vaccination.bits-dvm.org/api/auth", "_parent")}
                >Login with BITS Mail</Button>
                <Text mt="20px">Made with ❤️  by DVM</Text>
                <Text mt="20px" p="20px" width="400px" textAlign="center" color="grey">Please note, only students from the following batches will be currently allowed access:</Text>
                <Text mt="-30px" p="20px" width="400px" textAlign="center" color="green">{batches.toString()}</Text>
                <Link to="/devs">
                    <Text color="grey" mt="150px">Meet the Developers</Text>
                </Link>
            </Flex>
        </Flex>
        </>
    )
}

export default Login;
