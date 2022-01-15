import React, { useState, useEffect } from 'react'
import { 
    Heading,
    Text,
    Button,
    Box,
    Flex,
    Image,
    RadioGroup,
    Stack,
    Radio,
    Spinner,
} from '@chakra-ui/react'

import { useParams, Link } from "react-router-dom";

// https://vaccination.bits-dvm.org/api/admin/students


const Student = () => {
    let { id } = useParams();
    const [student, setStudent] = useState(null)
    const [value1, setValue1] = React.useState("")
    const [value2, setValue2] = React.useState("")
    
    const getData = (idparam) => {
        fetch('https://vaccination.bits-dvm.org/api/admin/student', { // Your POST endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                "_id" : idparam
            })
        }).then(response => 
        response.json().then(data => ({
            data: data,
            status: response.status
        })
        ).then(res => {
            if(res.data){
                console.log(res.data)
                setStudent(res.data)
                setValue1(radioCleanV(res.data.vaccination_status))
                setValue2(radioCleanM(res.data.manual_verification))
            } else {
                alert("ERROR RETRIEVING CONTENT.");
            }
        }))
    }

    const postData = () => {
        fetch('https://vaccination.bits-dvm.org/api/admin/update', { // Your POST endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                "_id" : id,
                "updates" : {
                    "vaccination_status": radioUpdateV(value1),
                    "manual_verification": radioUpdateM(value2),
                }
            })
        }).then(response => 
        response.json().then(data => ({
            data: data,
            status: response.status
        })
        ).then(res => {
            if(res.data){
                alert("Successfully updated student data.")
                // window.location.reload()
            } else {
                alert("ERROR POSTING DATA.");
            }
        }))
    }

    // const getPDF = () => {
    //     fetch('https://vaccination.bits-dvm.org/api/admin/get_pdf', { // Your POST endpoint
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': "Bearer " + localStorage.getItem('jwt')
    //         },
    //         body: JSON.stringify({
    //             "_id" : id,
    //         })
    //     }).then(response => 
    //         response.json().then(data => ({
    //             data: data,
    //             status: response.status
    //         })
    //     ).then(res => {
    //         if(res.data){
    //             console.log(res.data)
    //         } else {
    //             alert("ERROR RETRIEVING CONTENT.");
    //         }
    // }))}

    // date cleaner function
    const cleanDate = (dateTime) => {
        // 2002-08-09T10:33:30.000Z

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


    // const getConsent = () => {
    //     fetch('https://vaccination.bits-dvm.org/api/admin/get_consent', { // Your POST endpoint
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': "Bearer " + localStorage.getItem('jwt')
    //         },
    //         body: JSON.stringify({
    //             "_id" : id,
    //         })
    //     }).then(response => 
    //         response.json().then(data => ({
    //             data: data,
    //             status: response.status
    //         })
    //     ).then(res => {
    //         if(res.data){
    //             console.log(res.data)
    //         } else {
    //             alert("ERROR RETRIEVING CONTENT.");
    //         }
    // }))}


    useEffect(() => {
        getData(id)
    }, [])

    const radioCleanV = (props) => {
        if (props === "NONE") return String(1);
        else if (props === "PARTIAL") return String(2);
        else if (props === "COMPLETE") return String(3);
        else return 1;
    }

    const radioUpdateV = (props) => {
        if (props === "1") return "NONE"
        else if (props === "2") return "PARTIAL";
        else if (props === "3") return "COMPLETE";
    }

    const radioCleanM = (props) => {
        if (props === "FAILED") return String(1);
        else if (props === "PENDING") return String(2);
        else if (props === "DONE") return String(3);
        else return 1;
    }

    const radioUpdateM = (props) => {
        if (props === "1") return "FAILED"
        else if (props === "2") return "PENDING";
        else if (props === "3") return "DONE";
    }
  

    return(
        <>
        { student ? <> 
        <Flex flexDir="column" mt="50px" justifyContent="center" alignItems="center">
            <Image boxSize="100px" mb="20px" borderRadius="100%" src={ student.pic } />
            <Heading>{ student.name }</Heading>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Email</Text>
               <Text>{ student.email }</Text>
           </Flex>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Overall Status</Text>
            { student.overall_status ?  <Text color="green">Verified</Text>
            : <Text color="red">Unverified</Text>
            }
           </Flex>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Certificate PDF</Text>
                <Button onClick={() => window.open("https://vaccination.bits-dvm.org/api/admin/get_pdf?_id="+id)} isDisabled={!student.pdf}>View PDF</Button>
           </Flex>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Consent Form PDF</Text>
                <Button onClick={() => window.open("https://vaccination.bits-dvm.org/api/admin/get_consent?_id="+id)} isDisabled={!student.consent_form}>View PDF</Button>
           </Flex>


           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Auto Verification</Text>
               <Text>{ student.auto_verification }</Text>
           </Flex>

           
           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Vaccination Status</Text>
               <RadioGroup onChange={setValue1} value={value1}>
                    <Stack direction="row">
                        <Radio value="1">None</Radio>
                        <Radio value="2">Partial</Radio>
                        <Radio value="3">Complete</Radio>
                    </Stack>
                </RadioGroup>
           </Flex>


           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Manual Verification</Text>
               <RadioGroup onChange={setValue2} value={value2}>
                    <Stack direction="row">
                        <Radio value="1">Failed</Radio>
                        <Radio value="2">Pending</Radio>
                        <Radio value="3">Done</Radio>
                    </Stack>
                </RadioGroup>
           </Flex>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>City</Text>
               <Text>{ student.city }</Text>
           </Flex>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Containment Zone</Text>
               { student.is_containment_zone ? <Text color="red">Yes</Text> : <Text color="green">No</Text> }
           </Flex>

           <Flex flexDir="row" width="50vw" padding="10px" justifyContent="space-between" alignItems="center">
               <Text>Arrival Date</Text>
               <Text>{ cleanDate(student.arrival_date) }</Text>
           </Flex>

           <Flex flexDir="row" width="50vw" padding="20px" justifyContent="center" alignItems="center">
                <Link to="/">
                    <Button mr="30px">Back</Button>
                </Link>
                <Button onClick={postData} colorScheme="blue">Submit Update</Button>
            </Flex>


           
        </Flex>
        </> : <Flex flexDir="column" mt="50px" justifyContent="center" alignItems="center"><Spinner /></Flex>}</>
    )
}

export default Student;
