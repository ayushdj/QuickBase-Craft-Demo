/**
 * Importing the necessary modules from React
 */
import React from 'react';
import {Form, Button, Row, Col, Alert, Card} from 'react-bootstrap'
import {useState} from 'react';

/**
 * This function validates the string of choices that are passed in when submitting the form. 
 * It looks for violations of the specification (i.e. if choices contains a duplicate value 
 * or if we have more than 50 unique values). O(n) time and space complexity.
 * 
 * @param {*} choices the choices string
 * @param {*} defaultVal the default field
 * @returns a boolean array of size 2 representing the violations that have occurred. 
 *          if the first element in the array is true, then it means we have duplicates 
 *          in the choices input string, and if the second element is true, it means we 
 *          have more than 50 unique values in the choices string
 */
function validateChoices(choices, defaultVal) {
    // split the choices string on new line characters and put it into an array of strings
    var arrayOfChoices = choices.split("\n");

    // boolean to see whether choices contains the default value
    var containsDefaultChoice = false;

    // Looping over the array to see if the arrayOfChoices contains the default
    // If it doees, then we set containsDefaultChoice to true
    for (let i = 0; i < arrayOfChoices.length; i++) {
        // If the i'th string is equal to the default string regardless of
        // case, then we enter this block and set the containsDefaultChoice 
        // variable to true
        if (arrayOfChoices[i].toLowerCase() === defaultVal.toLowerCase()) {
            containsDefaultChoice = true;
        }
    }

    // If the array of choices doesn't contain the default, then we add it to the array.
    if (!containsDefaultChoice) {
        arrayOfChoices.push(defaultVal);
    }

    console.log(arrayOfChoices);
    
    // variable to figure out if we have a duplicate in the choices
    var hasDuplicate = false;

    // variable to figure out how many unique choices we have inputted.
    // If this value goes past 50, we let the user know.
    var numUniqueChoices = 0;

    // Hashmap to keep track of the frequency count of each word in the array
    var frequencyCount = {};

    // Determining frequency counts of each element in the array
    for (let i = 0; i < arrayOfChoices.length; i++) {
        var current = arrayOfChoices[i];

        // If we have an empty string, then we don't count that as a choice
        if (current === '') continue;

        // ternary operator: If the key exists, we update the value stored by 1. Otherwise, we put it
        // into the hashmap with a value of 1.
        frequencyCount[current] = frequencyCount[current] ? frequencyCount[current] + 1 : 1;
    }

    // Loop over the hashmap to figure out if we have any duplicates
    for (var string in frequencyCount) {
        // If the value associated with the current string is greater than 1, then we set the 
        // boolean hasDuplicate to be true.
        if (frequencyCount[string] > 1) {
            hasDuplicate = true;
            break;
        }
    }

    // Calculating the number of unique choices the user has put into the choices field
    for (var str in frequencyCount) {
        // If the value associated with the current string is 1 and only 1, then we increase
        // the number of unique choices.
        if (frequencyCount[str] === 1) {
            numUniqueChoices++;
        }
    }

    // isViolation[0] = a boolean representing whether the user has entered duplicate values in the "choices" field
    // isViolation[1] = a boolean representing whether the user has entered more than 50 choices in the "choices" field
    var isViolation = [false, false];

    // If we have found a duplicate, then we set the 0'th field to be true
    if (hasDuplicate) {
        isViolation[0] = true;
    }

    // If we found the number of unique choices to exceed 50, then we let the user know
    if (numUniqueChoices > 5) {
        isViolation[1] = true;
    }
    
    // return the isViolation array
    return isViolation;
}

/**
 * This function parses and returns the array of choices
 * 
 * @param {*} choices the choices string that we generated from the textarea input
 * @param {*} defaultChoice the default choice 
 * @returns the split up choices array as an array of strings, that will populate the
 *          "choices" field in the JSON object
 */
function splitInput(choices, defaultChoice) {
    
    // split the choices on a new line character
    var arrayOfChoices = choices.split("\n");

    // boolean to see whether choices contains the default value
    var containsDefaultChoice = false;

    // Looping over the array to see if the arrayOfChoices contains the default
    // If it doees, then we set containsDefaultChoice to true
    for (let i = 0; i < arrayOfChoices.length; i++) {
        // If the i'th string is equal to the default string regardless of
        // case, then we enter this block and set the containsDefaultChoice variable to true
        if (arrayOfChoices[i].toLowerCase() === defaultChoice.toLowerCase()) {
            containsDefaultChoice = true;
        }
    }

    // If the array of choices doesn't contain the default, then we add it to the array.
    if (!containsDefaultChoice) {
        arrayOfChoices.push(defaultChoice);
    }

    // If the array of choices contains an empty string '', then we want to remove that
    // from consideration so the JSON object doesn't have a random empty choice in the 
    // choices array. Pass in a lambda function that filters values based on not being 
    // equal to an empty string 
    const result = arrayOfChoices.filter(function(x) {
        return x !== '';
    });

    // return the choices array
    return result;
}

/**
 * The main function that handles the HTML and JS for the application
 * 
 * @returns the HTML to be rendered by index.js
 */
function Builder() {

    // Creating a dictionary of values to store the state variables
    const [values, setValues] = useState({

            // Variable to keep track of the label. Updates Every time we type something/delete something
            label: "",
            
            // Keeps track of the check box
            multiSelect: false,

            // Variable to keep track of what the user puts in the default field
            defaultChoice: "",

            // We have a string to keep track of the choices that the user enters and we will then
            // split this string based on new line characters
            choices: "",

            // This boolean is a state variable that decides if a user wants to
            // order the list of choices they entered
            orderAlphabetically: false
        }
    );

    // A state variable to keep track of the changes we make to submit the form
    const [savedChanges, setSavedChanges] = useState(false);

    // defining a state variable that allows users to dismiss the alert about submitting the form
    const [dismiss, setDismiss] = useState(true);

    // defining a state variable that declares an alert when a user has entered duplicate
    // values in the "contains" field
    const [duplicateAlert, setDuplicateAlert] = useState(false);

    // defining a state variable that provides an alert when a user exceeds 50 input values
    const [moreThan50Alert, setMoreThan50Alert] = useState(false);
    
    // update the label state variable
    const handleLabelInputChange = (event) => {
        // set the label
        setValues({...values, label:event.target.value})

        // storing in local storage
        localStorage.setItem("label", JSON.stringify(values.label));
    }

    // creating an event handler for the check box
    const handleCheck = (event) => {
        // set the value for the multi-select
        setValues({...values, multiSelect:event.target.checked});

        // storing in local storage
        localStorage.setItem("multiSelect", JSON.stringify(values.multiSelect));
    }

    // update the defaultChoice state variable
    const handleDefaultInputChange = (event) => {
        // set the default choice
        setValues({...values, defaultChoice:event.target.value})

        // storing in local storage
        localStorage.setItem("defaultChoice", JSON.stringify(values.defaultChoice));
    }

    // update the choices state variable
    const handleChoicesInputChange = (event) => {

        // We pass in the updated choices string to the validateChoices function we
        // defined up above
        let returnedArray = validateChoices(values.choices, values.defaultChoice);
        
        // set an alert based on the boolean returned by the function, and then
        // we set the state for both duplicateAlert and moreThan50Alert
        setDuplicateAlert(returnedArray[0]);
        setMoreThan50Alert(returnedArray[1]);

        // set the values associated with the choices
        setValues({...values, choices:event.target.value})

        // storing in local storage
        localStorage.setItem("choices", JSON.stringify(values.defaultChoice));
    }

    // creating an event handler function that allows the user to get rid of the 
    // "success" message that pops up after the user has submitted the changes they want
    const handleDismiss = (event) => {
        if (dismiss) {
            setDismiss(!dismiss);
        }
    }

    // creating an event handler for if the user wants to organize
    // the choices array alphabetically
    const handleAlphabeticalOrdering = (event) => {
        // set the values
        setValues({...values, orderAlphabetically:event.target.checked})
        localStorage.setItem("orderAlphabetically", JSON.stringify(values.orderAlphabetically));
    }
    
    // creating an event handler function to update the changes made to the form
    const handleSaveChanges = (event) => {
        
        event.preventDefault();

        // validate the choices textarea field and extract the array from that
        let isChoicesValid = validateChoices(values.choices, values.defaultChoice);

        // Only if the value stored in both array indices are false can we construct
        // our json object.
        if (!isChoicesValid[0] && !isChoicesValid[1]) {
            
            // split the choices state variable but add 
            var parsedChoices = splitInput(values.choices, values.defaultChoice);
            
            // If the builder wants the end-user to see a sorted list of choices,
            // then we sort that array of choices
            if (values.orderAlphabetically) {
                parsedChoices.sort();
            }

            // construct JSON object and populate it with the fields we populated with
            // the input fields
            const json = {
                "label" : values.label, 
                "multiSelect" : values.multiSelect,
                "defaultValue" : values.defaultChoice,
                "choices" : parsedChoices,
                "orderAlphabetically" : values.orderAlphabetically
            };

            // posting JSON to API
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://www.mocky.io/v2/566061f21200008e3aabd919", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                json
            }));

            // Log to the console as an indication that the JSON object has
            // been created, as per the specification
            console.log(json);

            // Set the saved changes to be true
            setSavedChanges(true);

            // clearing local storage after a user has submitted the form
            localStorage.clear();
        } else {
            // if either condition is violated (i.e. a user enters more than 50 distinct 
            // values in the choices field OR they have duplicates), we set the state 
            // back to be false
            setSavedChanges(false);
        }
    }

    // event handler function to reset all fields should the user want to do that
    const handleResetFields = (event) => {      
        // reload the page 
        window.location.reload(false);

        // clearing the local storage if the user resets everything
        localStorage.clear();
    }

    return (
        /* Wrap everything in a div because we don't want the form to hug the top of the page */
        <div className="py-5"> 
            <Card style={{width:'35rem' , marginLeft:"auto", marginRight:"auto", border:"2px solid #E1F5FE"}} xs={5}>
                {/*Creating an alert for when the user submits the form*/}
                {savedChanges ? <Alert variant="success" dismissible={true} show={dismiss} onClose={handleDismiss}>
                            Success! Your changes have been saved</Alert> : null}
                <Card.Header style={{backgroundColor:"#E1F5FE", fontWeight:"bold", color:"#4682b4"}}>Field Builder</Card.Header>
                <Card.Body style={{marginLeft:"10px", marginRight:"10px"}}>
                    <Form onSubmit={handleSaveChanges} autocomplete="on">
                        <Form.Group>
                            {/* The Label field */}
                            <Row>
                                <Col xs={3} sm={3} md={3} lg={3}><Form.Label>Label</Form.Label></Col>
                                <Col xs={7} sm={7} md={7} lg={7}><Form.Control type="text" placeholder="Label" 
                                    required={true} name="label" onChange={handleLabelInputChange} value={values.label}/>
                                </Col>
                            </Row>
                    
                            {/* The Type field */}
                            <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3}><Form.Label>Type</Form.Label></Col> 
                                <Col xs={3} sm={3} md={3} lg={3}>Multi-Select</Col>
                                <Col xs={5} sm={5} md={5} lg={5} style={{marginLeft:"-35px"}}><Form.Check type="checkbox" 
                                    label="A Value is required" onChange={handleCheck} value={values.multiSelect}/></Col>
                            </Row>
                    
                    
                            {/* The Default field */}
                            <Row style={{marginTop:"15px"}}> 
                                <Col xs={3} sm={3} md={3} lg={3}><Form.Label>Default Value</Form.Label></Col>
                                <Col xs={7} sm={7} md={7} lg={7}><Form.Control type="text" placeholder="text" placeholder="Default Choice" 
                                required={true} name="default" onChange={handleDefaultInputChange} value ={values.defaultChoice}/></Col>
                            </Row>

                    
                            {/* The Choices field */}
                            <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3}><Form.Label>Choices</Form.Label></Col>
                                <Col xs={7} sm={7} md={7} lg={7}><Form.Control as="textarea" rows={10}
                                    placeholder="Please add your choices separated by a new line (i.e. every line counts as a single choice)" 
                                    name="choices" onChange={handleChoicesInputChange} value={values.choices}/></Col>
                            </Row>

                            {/* Setting the conditional that will trigger the alerts about having duplicate choices*/}
                            {duplicateAlert ? <Row style={{marginLeft:"110px", marginTop:"15px"}}><Col sm={10} md={10} lg={10} xs={10}> <div 
                                className="alert alert-danger" marginTop="30px" role="alert">
                                Uh oh! Looks like you have a duplicate choice. Please delete any duplicates you may have</div></Col></Row>: null}

                            {/* Setting the conditional that will trigger the alerts about having more than 50 choices entered*/}
                            {moreThan50Alert ? <Row style={{marginLeft:"110px", marginTop:"15px"}}><Col sm={10} md={10} lg={10} xs={10}> 
                                <div className="alert alert-danger" role="alert">
                                Uh oh! You have exceeded your limit of 50 choices. Please delete some choices to stay within the 
                                limit</div></Col></Row> : null}
                
                            {/* The ordering field */}
                            <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3}><Form.Label>Order</Form.Label></Col> 
                                <Col xs={6} sm={6} md={6} lg={6}><Form.Check type="checkbox" label="Order choices alphabetically" 
                                    onChange={handleAlphabeticalOrdering} value={values.orderAlphabetically}/></Col>
                            </Row>
                            
                            {/* Creating the buttons */}
                            <Row style={{marginTop:"10px", marginLeft:"30px"}} className="justify-content-center">
                                <Col lg="auto" md="auto" sm="auto" xs="auto"><Button variant="success" type="btn btn-success">Save Changes</Button></Col>
                                <Col lg="auto" md="auto" sm="auto" xs="auto" style={{marginTop:"7px", marginLeft:"-10px", marginRight:"-10px"}}>Or</Col>
                                <Col lg="auto" md="auto" sm="auto" xs="auto"><Button type="reset" onClick={handleResetFields} 
                                    className="btn btn-danger">Reset Form</Button></Col>
                            </Row>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

// Exporting the HTML
export default Builder;