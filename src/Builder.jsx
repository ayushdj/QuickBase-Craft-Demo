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

    // print to console just to visualize
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
            // set to true and break
            hasDuplicate = true;
            break;
        }
    }

    // Calculating the number of unique choices the user has put into the choices field
    for (var str in frequencyCount) {
        // If the value associated with the current string is 1 and only 1, then we increase
        // the number of unique choices.
        if (frequencyCount[str] === 1) {
            // increment 
            numUniqueChoices++;
        }
    }

    // boolean that determines if the array of choices has a string that is greater than 40 in length
    var exceeds40 = false;

    // determining if the user has entered a choice that exceeds 40 characters in length
    for (let i = 0; i < arrayOfChoices.length; i++) {
        // if the ith string exceeds 40 in length, set the boolean variable to true
        if (arrayOfChoices[i].length > 40) {
            exceeds40 = true;
        }
    }

    let limitExceeded = false;
    if (numUniqueChoices > 50) limitExceeded = true;

    var violations = {
        duplicate: hasDuplicate,
        moreThan50: limitExceeded,
        charLimitExceeded: exceeds40
    }

    return violations;
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

    // Creating an object of values to store the state variables
    const [values, setValues] = useState({

        // Variable to keep track of the label. Updates Every time we type something/delete something
        label: '',
        
        // Keeps track of the check box
        required: false,

        // Variable to keep track of what the user puts in the default field
        defaultChoice: '',

        // We have a string to keep track of the choices that the user enters and we will then
        // split this string based on new line characters
        choices: '',

        // This boolean is a state variable that decides if a user wants to
        // order the list of choices they entered
        displayAlpha: false
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

    // defining a state variable that provides an alert when a user exceeds to 40 character
    // limit
    const [charLimitExceededAlert, setCharLimitExceededAlert] = useState(false);

    // update the label state variable
    const handleLabelInputChange = (event) => {
        // set the label
        setValues({...values, label:event.target.value})
    }

    // creating an event handler for the check box
    const handleCheck = (event) => {
        // set the value for the multi-select
        setValues({...values, required:event.target.checked});
    }

    // update the defaultChoice state variable
    const handleDefaultInputChange = (event) => {
        // set the default choice
        setValues({...values, defaultChoice:event.target.value})
        
    }

    // update the choices state variable
    const handleChoicesInputChange = (event) => {

        // We pass in the updated choices string to the validateChoices function we
        // defined up above
        let violations = validateChoices(values.choices, values.defaultChoice);
        
        // set an alert based on the boolean returned by the function, and then
        // we set the state for duplicateAlert, moreThan50Alert and charLimitExceededAlert
        //setDuplicateAlert(returnedArray[0]);
        //setMoreThan50Alert(returnedArray[1]);
        //setCharLimitExceededAlert(returnedArray[2]);

        setDuplicateAlert(violations.duplicate);
        setMoreThan50Alert(violations.moreThan50);
        setCharLimitExceededAlert(violations.charLimitExceeded);

        // set the values associated with the choices
        setValues({...values, choices:event.target.value})
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
        setValues({...values, displayAlpha:event.target.checked})
    }
    
    // creating an event handler function to update the changes made to the form
    const handleSaveChanges = (event) => {
        
        event.preventDefault();

        // validate the choices textarea field and extract the array from that
        let validChoices = validateChoices(values.choices, values.defaultChoice);

        // Only if the value stored in all array indices are false can we construct
        // our json object.
        if (validChoices.duplicate === false && validChoices.moreThan50 === false && validChoices.charLimitExceeded === false) {
            
            // split the choices state variable into an array of strings 
            var parsedChoices = splitInput(values.choices, values.defaultChoice);
            
            // If the builder wants the end-user to see a sorted list of choices,
            // then we sort that array of choices
            if (values.displayAlpha) {
                parsedChoices.sort();
            }

            // construct JSON object and populate it with the fields we populated with
            // the input fields
            const json = {
                "label" : values.label, 
                "required" : values.required,
                "choices" : parsedChoices,
                "displayAlpha" : values.displayAlpha,
                "default" : values.defaultChoice,
            };

            // posting JSON to API provided
            var postObject = new XMLHttpRequest();
            postObject.open("POST", "https://www.mocky.io/v2/566061f21200008e3aabd919", true);
            postObject.setRequestHeader('Content-Type', 'application/json');
            postObject.send(JSON.stringify({
                json
            }));

            // Log to the console as an indication that the JSON object has
            // been created, as per the specification
            console.log(json);

            // Set the saved changes to be true
            setSavedChanges(true);
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
    }

    return (
        /* Wrap everything in a div because we don't want the form to hug the top of the page */
        <div className="py-5"> 
            <Card style={{minWidth:'20rem', maxWidth:'35rem' , marginLeft:"auto", marginRight:"auto", border:"2px solid #E1F5FE"}}>
                {/*Creating an alert for when the user submits the form*/}
                {savedChanges ? <Alert variant="success" dismissible={true} show={dismiss} onClose={handleDismiss}>
                            Success! Your changes have been saved</Alert> : null}
                <Card.Header style={{backgroundColor:"#E1F5FE", fontWeight:"bold", color:"#4682b4"}}>Field Builder</Card.Header>
                <Card.Body style={{marginLeft:"10px", marginRight:"10px"}}>
                    <Form onSubmit={handleSaveChanges}>
                        <Form.Group>
                            {/* The Label field */}
                            <Row>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}><Form.Label>Label</Form.Label></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}><Form.Control type="text" placeholder="Label" 
                                    required={true} name="label" onChange={handleLabelInputChange} value={values.label}/></Col>
                            </Row>

                            {/* If the user hasn't entered the label field, then we let them know that it is required. Otherwise we
                            do nothing */}
                            { values.label === '' ? <Row>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}> <span style={{color:"red", fontSize:"15px"}}>*This Field is Required</span></Col>
                            </Row> : null}    
                    
                            {/* The Type field */}
                            <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}><Form.Label>Type</Form.Label></Col> 
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>Multi-Select</Col>
                                <Col xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} style={{marginLeft:"-35px"}}><Form.Check type="checkbox" 
                                    label="A Value is required" onChange={handleCheck} value={values.required}/></Col>
                            </Row>
                    
                    
                            {/* The Default field */}
                            <Row style={{marginTop:"15px"}}> 
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}><Form.Label>Default Value</Form.Label></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}><Form.Control type="text" placeholder="Default Choice" 
                                required={true} name="default" onChange={handleDefaultInputChange} value ={values.defaultChoice}/></Col>
                            </Row>

                            {/* If the user hasn't entered the default value, then we let them know that it is required. Otherwise we
                            do nothing */}
                            { values.defaultChoice === '' ? <Row>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}> <span style={{color:"red", fontSize:"15px"}}>*This Field is Required</span></Col>
                            </Row> : null} 

                    
                            {/* The Choices field */}
                            <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}><Form.Label>Choices</Form.Label></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}><Form.Control as="textarea" rows={10}
                                    placeholder="Please add your choices separated by a new line (i.e. every line counts as a single choice)" 
                                    name="choices" onChange={handleChoicesInputChange} value={values.choices}/></Col>
                            </Row>

                            {/* Setting the conditional that will trigger the alerts about having duplicate choices*/}
                            {duplicateAlert ? <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}> <div className="alert alert-danger" role="alert">Uh oh! Your most recent entry already exists. 
                                Please delete and enter another.</div></Col></Row> : null}

                            {/* Setting the conditional that will trigger the alerts about having more than 50 choices entered*/}
                            {moreThan50Alert ?  <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}> <div className="alert alert-danger" role="alert">Uh oh! You have exceeded your limit of 50 choices. 
                                Please delete the latest choice you entered to stay within the limit.</div></Col></Row>: null}

                            {charLimitExceededAlert ? <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Col>
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}> <div className="alert alert-danger" role="alert">
                                Uh oh! Your latest choice exceeds the 40 character limit. Choices must be within 40 characters in length.
                                </div></Col></Row> : null}    
                
                            {/* The ordering field */}
                            <Row style={{marginTop:"15px"}}>
                                <Col xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}><Form.Label>Order</Form.Label></Col> 
                                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}><Form.Check type="checkbox" label="Display choices in alphabetical order" 
                                    onChange={handleAlphabeticalOrdering} value={values.displayAlpha}/></Col>
                            </Row>
                            
                            {/* Creating the buttons */}
                            <Row style={{marginTop:"10px", marginLeft:"30px"}} className="justify-content-center">
                                <Col lg="auto" md="auto" sm="auto" xs="auto"><Button variant="success" type="btn btn-success" size="sm">Save Changes</Button></Col>
                                <Col lg="auto" md="auto" sm="auto" xs="auto" style={{ marginLeft:"-20px", marginRight:"-20px", marginTop:"3px"}}>Or</Col>
                                <Col lg="auto" md="auto" sm="auto" xs="auto"><Button size="sm" type="reset" onClick={handleResetFields} 
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