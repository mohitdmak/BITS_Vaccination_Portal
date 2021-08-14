import { React, useState, useEffect} from 'react'

import {
    Flex,
    Box,
    Text,
    Heading,
    GridItem,
    Grid,
    Image,
    Button,
} from '@chakra-ui/react'

import {
    Link,
} from "react-router-dom";




const Dashboard = (props) => {

    const [name, setName] = useState("Parth Sharma")
    const [pp, setPP] = useState("https://avatars.githubusercontent.com/u/45586386?v=4")
    const [certificate, setCertificate] = useState(null)
    const [consent, setConsent] = useState(null)
    const [status, setStatus] = useState(false)
    const [one, setOne] = useState(1)

    function cleanOne(auto) {
        if (auto === "PENDING") setOne(0)
        else if (auto === "CONFIRMED") setOne(1)
        else setOne(2)
    }

    const campus = "Pilani Campus"
    const bits = "https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/b4/20/40/b420401e-c883-b363-03b5-34509d67c214/source/512x512bb.jpg"
    const dvm = "https://avatars.githubusercontent.com/u/14038814?s=200&v=4"

    const done = "https://i.imgur.com/hMXnx8d.png"
    const pending = "https://i.imgur.com/kHguvEu.png"
    const no = "https://i.imgur.com/lETEPEq.png"

    useEffect(() => {
        apiRequest();
    }, []); 


    

    // This will upload the file after having read it
    const upload = (file) => {
        fetch('https://vaccination.bits-dvm.org/api/student/pdf', { // Your POST endpoint
            method: 'POST',
            body: file // This is your file object
        }).then(
            response => response.json() // if the response is a JSON object
        ).then(
            success => console.log(success) // Handle the success response object
        ).catch(
            error => console.log(error) // Handle the error response object
        );
    };

    const input = document.getElementById('fileinput');
    const input2 = document.getElementById('fileinput2');

    // Event handler executed when a file is selected
    const onSelectFile = () => upload(input.files[0]);
    const onSelectFile2 = () => upload(input2.files[0]);
    
    const apiRequest = () => {
        fetch('https://vaccination.bits-dvm.org/api/student/details/',
                {   
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            ).then(response => 
                response.json().then(data => ({
                    data: data,
                    status: response.status
                })
            ).then(res => {
                if(res.data){
                    setName(res.data.name)
                    setPP(res.data.pic)
                    // if (res.data.pdf){
                    //     setCertificate(res.data.pdf)
                    // }
                    // if (res.data.consentForm){
                    //     setConsent(res.data.consentForm)
                    // }
                    setStatus(res.data.vaccination_status)
                    setOne(cleanOne(res.data.auto_verification))
                } else {
                    alert("ERROR RETRIEVING CONTENT.");
                }
            }))
    }

    return (
        <>
            <Flex 
                flexDir="column"
                alignItems="center"
                justifyContent="center"
            >
                {/* NAVBAR */}
                <Flex
                    mt="20px"
                    mb="20px"
                    flexDir="row"
                    width="80%"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    
                    <Heading 
                        fontSize={["18px", "18px", "18px", "24px", "24px"]}
                        color="#363636"
                    >Vaccination Status Portal
                    </Heading>
                    
                    
                        <Button 
                            bg="red" 
                            color="white"
                            fontWeight="bold"
                            fontSize={["12px", "12px", "12px", "18px", "18px"]}
                            onClick={() => window.open("https://vaccination.bits-dvm.org/api/auth/logout", "_parent")}
                        >Logout
                        </Button> 

                </Flex>
                {/* END NAVBAR */}


                <Flex 
                    flexDir={["column","column","column","row","row"]}
                    alignItems="center"
                    justifyContent="center"
                    width="80vw"
                >

                    {/* NAME CARD */}
                    <Box 
                        bg="#FAFAFA" 
                        borderRadius="10px"
                        m="20px"
                        p="30px"
                        width={["80vw", "80vw", "80vw", "500px", "500px"]}
                        height={["80px", "80px", "80px", "120px", "120px"]}
                        display="flex"
                        alignItems="center"
                    >
                       <Flex flexDir="row" alignItems="center">
                           <Image 
                                src={pp} 
                                mr="20px" 
                                boxSize={["50px", "50px", "50px", "80px", "80px"]}
                                borderRadius="100%"
                            />
                           <Flex flexDir="column">
                               <Heading 
                                    fontSize={["20px", "20px", "20px", "24px", "24px"]}
                                >{name}</Heading>
                               <Text 
                                    fontSize={["14px", "14px", "14px", "22px", "22px"]}
                                >{campus}</Text>
                           </Flex>
                       </Flex>
                    </Box>
                    
                    {/* STATUS CARD */}
                    <Box 
                        bg="#FAFAFA" 
                        borderRadius="10px"
                        p="30px"
                        ml="20px"
                        mr="20px"
                        width={["80vw", "80vw", "80vw", "500px", "500px"]}
                        height={["80px", "80px", "80px", "120px", "120px"]}
                        display="flex"
                        flexDir="column"
                        justifyContent="center"
                    >
                        <Flex flexDir="column">
                            <Text 
                                mb="-2px"
                                fontSize={["14px", "14px", "14px", "22px", "22px"]}
                            >VACCINATION STATUS</Text>
                            {status ? 
                                <Heading 
                                    color="green"
                                    fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                >FULLY VACCINATED</Heading> : 
                                <Heading 
                                    color="red"
                                    fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                >NOT VACCINATED</Heading>}
                               
                        </Flex>
                    </Box>
                </Flex>
            
                <Grid 
                    templateColumns={["repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(6, 1fr)", "repeat(6, 1fr)"]}
                    bg="#FAFAFA"
                    mt="20px"
                    borderRadius="10px"
                    p="20px"
                    gap={6}
                    width={["80vw", "80vw", "80vw", "1040px", "1040px"]}
                >
                    {/* <Flex flexDir="row" m="10px" alignItems="center"> */}
                    <GridItem rowSpan={1} colSpan={2} display="flex" flexDir="row">
                        <Text fontWeight="bold">Latest Vaccine Certificate:</Text>
                        {(one === 1) ? <Image src={done} ml="10px" boxSize="30px" /> : null}
                        {(one === 0) ? <Image src={pending} ml="10px" boxSize="30px" />: null}
                        {(one === 2) ? <Image src={no} ml="10px" boxSize="30px" /> : null}
                    </GridItem>
                       
                    <GridItem rowSpan={1} colSpan={1}>
                        <Button 
                            ml="10px" 
                            mr="10px"
                            isDisabled={certificate ? false : true}
                            onClick={() => window.open(certificate, "_blank")}
                        >View</Button>
                    </GridItem>
                    
                    <GridItem rowSpan={1} colSpan={3}>
                        <form>
                            <input type="file" id="fileinput"/>
                            <Button 
                                mt={["10px","Opx","10px","0px","0px"]}
                                onClick={onSelectFile}
                                >Update</Button>
                        </form>
                    </GridItem>
                    
                    <GridItem rowSpan={1} colSpan={2} display="flex" flexDir="row">
                        <Text fontWeight="bold" mt="20px">Parent Consent Form:</Text>
                        {/* <Image src={pending} ml="10px" mt="20px" boxSize="30px" /> */}
                    </GridItem>

                    <GridItem rowSpan={1} colSpan={1}>
                        <Button 
                        isDisabled={consent ? false : true}
                        onClick={() => window.open(consent, "_blank")}
                        ml="10px" mr="10px" mt="20px"
                        >View</Button>
                    </GridItem>

                    <GridItem rowSpan={1} colSpan={3} mt="20px">
                        <form>
                            <input type="file" id="fileinput2" />
                            <Button 
                                mt={["10px","Opx","10px","0px","0px"]}
                                onClick={onSelectFile2}
                            >Update</Button>
                        </form>
                    </GridItem>
                    {/* </Flex> */}
                </Grid>

                <Flex 
                    flexDir={["column","column","column","row","row"]}
                    alignItems="center" 
                    mt="80px"
                    mb="50px"
                >
                    An initiative by
                    <Image src={bits} ml="10px" mr="5px" mt="5px" height="80px" />
                    and
                    <Image src={dvm} ml="20px" mr="20px" mt="10px"boxSize="70px" />
                </Flex>
                
            </Flex>   
           
        </>
    )
}

export default Dashboard;
