import { React, useState, useEffect } from 'react'

import {
    Flex,
    Box,
    Text,
    Heading,
    GridItem,
    Grid,
    Image,
    Button,
    Spinner,
    Input,
    Switch,
    Checkbox,
    Stack,
} from '@chakra-ui/react'

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

// import date-fns
import { parseISO } from 'date-fns'

// import {
//     Link,
// } from "react-router-dom";


const Dashboard = (props) => {

    const [name, setName] = useState("")
    const [pp, setPP] = useState("")
    const [campus, setCampus] = useState("")
    const [certificate, setCertificate] = useState(false)
    const [consent, setConsent] = useState(false)
    const [status, setStatus] = useState("NONE")
    const [one, setOne] = useState(0)
    const [city, setCity] = useState("")
    const [isContainment, setIsContainment] = useState(false)
    const [checkedItems, setCheckedItems] = useState([false, false, false])
    const [arrival, setArrival] = useState(new Date())

    const allChecked = checkedItems.every(Boolean)
    const isIndeterminate = checkedItems.some(Boolean) && !allChecked


    function verifiedStatusCalc(auto, manual) {
        if (manual !== "PENDING") return manual;
        else if (auto === "FAILED") return manual;
        else return auto;
    }

    function cleanOne(auto, manual) {
        const verifiedStatus = verifiedStatusCalc(auto, manual);
        if (verifiedStatus === "PENDING") setOne(0)
        else if (verifiedStatus === "DONE") setOne(1)
        else setOne(2)
    }

    const bits = "https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/b4/20/40/b420401e-c883-b363-03b5-34509d67c214/source/512x512bb.jpg"
    const dvm = "https://avatars.githubusercontent.com/u/14038814?s=200&v=4"

    const done = "https://i.imgur.com/nzWA3lo.png"
    const pending = "https://i.imgur.com/wBu34AZ.png"
    const no = "https://i.imgur.com/RiobXwU.png"

    useEffect(() => {
        apiRequest();
    }, []);

    // This will upload the file after having read it
    const upload = (data) => {
        fetch('https://vaccination.bits-dvm.org/api/student/post_pdf', { // Your POST endpoint
            method: 'POST',
            body: data // This is your file object
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
            }
        ).then(
            success => {
                apiRequest();
                alert("File successfully uploaded!")
            }
        ).catch(
            err => {
                return err.json().then(errormsg => {
                    alert("Your PDF was not accepted due to the following error: " + errormsg?.error)
                })
                
            }
        );
    };

    const upload2 = (data) => {
        fetch('https://vaccination.bits-dvm.org/api/student/post_consent', { // Your POST endpoint
            method: 'POST',
            body: data // This is your file object
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
            }
        ).then(
            success => {
                apiRequest();
                alert("File successfully uploaded!")
            }
        ).catch(
            err => {
                return err.json().then(errormsg => {
                    alert("Your PDF was not accepted due to the following error: " + errormsg?.error)
                })
            }
        );
    };

    const extraDetailsPost = () => {
        console.log("Extras")
        console.log(
            {
                "city": city,
                "is_containment_zone": isContainment,
                "is_medically_fit": checkedItems[0], // should be is_medically_fit
                "TnC1_Agreement": checkedItems[1],
                "TnC2_Agreement": checkedItems[2],
                "arrival_date": arrival,
            }
        )
        fetch('https://vaccination.bits-dvm.org/api/student/extra', { // Your POST endpoint
            method: 'POST',
            body: JSON.stringify({
                "city": city,
                "is_containment_zone": isContainment,
                "is_medically_fit": checkedItems[0], // should be is_medically_fit
                "TnC1_Agreement": checkedItems[1],
                "TnC2_Agreement": checkedItems[2],
                "arrival_date": arrival,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(
            response => {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
            }
        ).then(
            success => {
                alert("Details successfully saved");
                apiRequest();
            }
        ).catch(
            err => {
                alert("Your details were not successfully saved due to error: " + err?.error)
            }
        );
    };


    const input = document.getElementById('fileinput');
    const input2 = document.getElementById('fileinput2');

    // Event handler executed when a file is selected
    const onSelectFile = () => {
        var data = new FormData()
        console.log(input)
        console.log(input.files[0])
        if (input.files[0]) {
            if ((input.files[0].size / 1000000) <= 1) {
                data.append('pdf', input.files[0])
                upload(data)
            } else {
                alert("File size is abnormally large.")
            }
        } else {
            alert("Please choose a valid file!")
        }
    }

    const onSelectFile2 = () => {
        var data = new FormData()
        if (input2.files[0]) {
            if ((input2.files[0].size / 1000000) <= 3) {
                data.append('consent_form', input2.files[0])
                upload2(data)
            } else {
                alert("File size is abnormally large.")
            }
        } else {
            alert("Please choose a valid file!")
        }
    }

    const campusCalc = (email) => {
        try {
            if (email.includes("@goa")) return "Goa Campus"
            if (email.includes("@hyderabad")) return "Hyderabad Campus"
            if (email.includes("@pilani")) return "Pilani Campus"
            else return "Campus Unknown"
        }
        catch (err) {
            return "Campus Unknown"
        }
    }

    const apiRequest = () => {
        fetch('https://vaccination.bits-dvm.org/api/student/details/',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
                // response.json().then(data => ({
                //     data: data,
                //     status: response.status
                // })
            })
            .then(res => {
                if (res.email) {
                    setName(res.name || "No name")
                    setPP(res.pic || "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg")
                    setCampus(campusCalc(res.email))
                    setStatus(res.vaccination_status || "NONE")
                    cleanOne(res.auto_verification, res.manual_verification)
                    if (res.pdf) setCertificate(true)
                    if (res.consent_form) setConsent(true)
                    setCity(res.city || "")
                    setArrival(res.arrival_date ? parseISO(res.arrival_date) : new Date())
                    setIsContainment(res.is_containment_zone || false)
                    setCheckedItems([res.is_medically_fit || false, res.TnC1_Agreement || false, res.TnC2_Agreement || false])
                } else {
                    alert("ERROR RETRIEVING CONTENT.");
                }
            })
            .catch(err => {
                alert("ERROR RETRIEVING CONTENT.");
            }
            );
    }

    return (
        <>{name ?

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
                            onClick={
                                () => {
                                    window.open("https://vaccination.bits-dvm.org/api/auth/logout", "_parent")
                                }
                            }
                        >Logout
                        </Button>

                    </Flex>
                    {/* END NAVBAR */}


                    <Flex
                        flexDir={["column", "column", "column", "row", "row"]}
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
                                {(status === "NONE") ?
                                    <Heading
                                        color="red"
                                        fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                    >NOT VACCINATED</Heading> :
                                    <>
                                        {(status === "PARTIAL") ?
                                            <Heading
                                                color="orange"
                                                fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                            >PARTIALLY VACCINATED</Heading> :
                                            <Heading
                                                color="green"
                                                fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                            >FULLY VACCINATED</Heading>
                                        }</>}
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
                            <Text fontWeight="bold">Latest Vaccine Certificate (PDF):</Text>
                            {(one === 1) ? <Image src={done} ml="10px" boxSize="30px" /> : null}
                            {(one === 0) ? <Image src={pending} ml="10px" boxSize="30px" /> : null}
                            {(one === 2) ? <Image src={no} ml="10px" boxSize="30px" /> : null}
                        </GridItem>

                        <GridItem rowSpan={1} colSpan={1}>
                            <Button
                                ml="10px"
                                mr="10px"
                                isDisabled={!certificate}
                                onClick={() => window.open("https://vaccination.bits-dvm.org/api/student/get_pdf", "_blank")}
                            >View</Button>
                        </GridItem>

                        <GridItem rowSpan={1} colSpan={3}>
                            <form>
                                <input
                                    type="file"
                                    disabled={(status === "COMPLETE")}
                                    accept="application/pdf"
                                    id="fileinput"
                                />
                                <Button
                                    mt={["10px", "Opx", "10px", "0px", "0px"]}
                                    onClick={onSelectFile}
                                    isDisabled={(status === "COMPLETE")}
                                >Update</Button>
                            </form>
                        </GridItem>


                        <GridItem rowSpan={1} colSpan={2} display="flex" flexDir="row">
                            <Text fontWeight="bold" mt="20px">Parent Consent Form (PDF):</Text>
                            {/* <Image src={pending} ml="10px" mt="20px" boxSize="30px" /> */}
                        </GridItem>

                        <GridItem rowSpan={1} colSpan={1}>
                            <Button
                                isDisabled={!consent}
                                onClick={() => window.open("https://vaccination.bits-dvm.org/api/student/get_consent", "_blank")}
                                ml="10px" mr="10px" mt="20px"
                            >View</Button>
                        </GridItem>

                        <GridItem rowSpan={1} colSpan={3} mt="20px">
                            <form>
                                <input type="file" accept="application/pdf" id="fileinput2" />
                                <Button
                                    mt={["10px", "Opx", "10px", "0px", "0px"]}
                                    onClick={onSelectFile2}
                                >Update</Button>
                            </form>
                        </GridItem>
                        {/* </Flex> */}
                    </Grid>

                    <Flex
                        flexDir="column"
                        justifyContent="center"
                        alignItems="center"
                        mt="20px"
                        width={["80vw", "80vw", "80vw", "1040px", "1040px"]}
                        bg="#FAFAFA"
                        p="20px"
                        borderRadius="10px"
                    >
                        <Box width={"100%"}>
                            {/* Make a text input field for city of residence */}
                            <Text textAlign={"left"} >
                                <Text fontWeight="bold">Current place of stay (Village/District + State) * </Text>
                                {(city === "") ?
                                    <Text color="red" fontSize={'small'} >Please enter this field</Text> : null
                                }
                            </Text>
                            <Input
                                mt="10px"
                                placeholder="Village/District + State"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </Box>
                        <Flex width={"100%"} mt="40px" flexDirection="row" alignItems="center" >
                            {/* Make a boolean input with the question "Is your current location is a containment zone?"  */}
                            <Text textAlign={"left"} >
                                <Text fontWeight="bold">Is your current location a containment zone? * </Text>
                            </Text>
                            {/* Make a chakra switch button */}
                            <Switch
                                ml="10px"
                                isContainment={isContainment}
                                onChange={() => setIsContainment(!isContainment)}
                                size={["lg"]}
                            />
                        </Flex>
                        {/* Add a react date time picker */}
                        <Flex width={"100%"} mt="40px" flexDirection={["column", "column", "row", "row", "row"]} alignItems="center" >
                            <Flex fontWeight="bold" whiteSpace="nowrap" width={["100%", "100%", "max-content", "max-content", "max-content" ]} mr={[0, 0, "20px", "20px", "20px"]} >Date of Arrival * </Flex>
                            <DatePicker
                                selected={arrival}
                                onChange={(date) => setArrival(date)}
                                showTimeSelect
                                dateFormat="MMMM d, yyyy h:mm aa"
                            />
                        </Flex>

                        <Box width={"100%"} mt="50px" bg="rgba(0, 0, 0, 0.05)" p="10px" borderRadius="10px" >
                            {/* Make a checkbox group with 3 checkboxes for the following: 
                            "I do not have fever/sore throat like symptoms and I am medically fit to travel and stay on the campus.", 
                            "I understand the severity of the situation and will follow the suggestion given by the doctor at Medical Center, BITS Pilani and I have no objection in undergoing the COVID-19 test. The doctor's suggestion is binding. Any violation of the rule may lead to strict action as per the government/Institute rules. ", 
                            "I agree with the conditions mentioned above. Any violation of the agreement may lead to disciplinary action. " */}
                            <>
                                <Checkbox
                                    isChecked={checkedItems}
                                    isIndeterminate={isIndeterminate}
                                    onChange={(e) => setCheckedItems([e.target.checked, e.target.checked, e.target.checked])}
                                    size={["lg"]}
                                >
                                    <Text fontWeight="bold">
                                        I agree to all declarations below.
                                    </Text>
                                </Checkbox>
                                <Stack pl={6} mt={1} spacing={1}>
                                    <Checkbox
                                        isChecked={checkedItems[0]}
                                        onChange={(e) => setCheckedItems([e.target.checked, checkedItems[1], checkedItems[2]])}
                                        mt="10px"
                                    >
                                        I do not have fever/sore throat like symptoms and I am medically fit to travel and stay on the campus.
                                    </Checkbox>
                                    <Checkbox
                                        isChecked={checkedItems[1]}
                                        onChange={(e) => setCheckedItems([checkedItems[0], e.target.checked, checkedItems[2]])}
                                        mt="10px"
                                    >
                                        I understand the severity of the situation and will follow the suggestion given by the doctor at Medical Center, BITS Pilani and I have no objection in undergoing the COVID-19 test. The doctor's suggestion is binding. Any violation of the rule may lead to strict action as per the government/Institute rules.
                                    </Checkbox>
                                    <Checkbox
                                        isChecked={checkedItems[2]}
                                        onChange={(e) => setCheckedItems([checkedItems[0], checkedItems[1], e.target.checked])}
                                        mt="10px"
                                    >
                                        I agree with the conditions mentioned above. Any violation of the agreement may lead to disciplinary action.
                                    </Checkbox>
                                </Stack>
                            </>
                        </Box>



                        <Button
                            onClick={() => {
                                if (city === "" || arrival === null || !allChecked) {
                                    alert("Please fill all the fields");
                                } else {
                                    // console.log(city, arrival, isContainment, checkedItems);
                                    extraDetailsPost()
                                }
                            }}
                            mt="60px"
                            width={["100%", "100%", "100%", "200px", "200px"]}
                            height={["50px", "50px", "50px", "60px", "60px"]}
                            bg="blue"
                            color="white"
                            fontSize={["14px", "14px", "14px", "22px", "22px"]}
                            fontWeight="bold"
                            borderRadius="10px"
                        >
                            Submit
                        </Button>
                    </Flex>

                    <Flex
                        flexDir={["column", "column", "column", "row", "row"]}
                        alignItems="center"
                        mt="80px"
                        mb="50px"
                    >
                        An initiative by
                        <Image src={dvm} ml="10px" mr="10px" mt="5px" height="80px" />
                        and
                        <Image src={bits} ml="20px" mr="20px" mt="10px" boxSize="70px" />
                    </Flex>

                </Flex>

            </> : <Flex flexDir="row" alignItems="center" justifyContent="center">
                <Spinner /></Flex>}</>
    )
}

export default Dashboard;
