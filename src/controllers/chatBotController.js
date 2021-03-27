require("dotenv").config();
import e from "express";
import request from "request";
const {Octokit} = require("@octokit/core");

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let postWebhook = (req,res)=>{
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function

            if (webhook_event.message.attachments == undefined) {
                handleMessage(sender_psid, webhook_event.message);        
            } else {
                callSendAPI(sender_psid, "Sorry I cannot handle images and thumbs up and images");
                //handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

};

let getWebhook = (req,res) =>{
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = MY_VERIFY_TOKEN
        
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);      
        }
    }
};

// Sends response messages via the Send API
function callSendAPI(req_type, sender_psid, response) {
    // Construct the message body
    if (req_type == "text")
    {
        var request_body = {
            "recipient": {
            "id": sender_psid
            },
            "message": {"text":response}
        }
    } else
    {
        var request_body = {
            "recipient": {
            "id": sender_psid
            },
            "message": response
        }
    }
    
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v10.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
        console.log('message sent!')
        } else {
        console.error("Unable to send message:" + err);
        }
    }); 
}

function handleMessage(sender_psid, message) {

    if (message.is_echo == true){
        console.log("echo message isolated");
    }
    else{
        console.log(message.nlp.intents.length == 0)
        if (message.nlp.intents.length == 0){
            callSendAPI("text",sender_psid, "Sorry I don't understand"); 
        }
        else{
            switch(message.nlp.intents[0].name){
                
                case 'general_bye':
                    callSendAPI("text",sender_psid, general_bye_message());
                    break;
                
                case 'general_contact':
                    callSendAPI("text",sender_psid,general_contact_message());
                    break;

                case 'general_greetings':
                    callSendAPI("text",sender_psid,general_greetings_message());
                    break;
                
                case 'general_introduction':
                    callSendAPI("text",sender_psid,general_introduction_message());
                    break;

                case 'general_languages':
                    callSendAPI("text",sender_psid,general_languages_message());
                    break;

                case 'personal_age':
                    callSendAPI("text",sender_psid,personal_age_message());
                    break;

                case 'personal_hobbies':
                    callSendAPI("text",sender_psid, personal_hobbies_message2());
                    callSendAPI("image",sender_psid, personal_hobbies_message());
                    break;
                
                case 'pro_education':
                    callSendAPI("text",sender_psid,pro_education_message());
                    break;
                
                case 'pro_experiences':
                    callSendAPI("text",sender_psid,professinnal_experiences_message());
                    break;

                case 'pro_programming_language':
                    callSendAPI("text",sender_psid,pro_programming_language_message());
                    break;

                case 'pro_skills':
                    callSendAPI("text",sender_psid,pro_skills_message());
                    break;

                    
                case 'pro_projects':
                    callSendAPI("text",sender_psid, "Here are his latests projects : ");
                    getProject(sender_psid)
                    break;
                
                default:
                    callSendAPI("text",sender_psid, "Sorry I don't understand. Can you ask your question differently ?");
            }
            
        }
    }
}

module.exports =  {
postWebhook :  postWebhook, 
getWebhook : getWebhook
}

function general_greetings_message(){
    var text = "Hi ! 👋🏻 \
                    \nI am Neutio, Kevin's Chatbot, I will guide you through Kevin's professional career. Feel Free to ask me questions about him. \
                    \nYou can say for example: \
                    \n💁🏻‍♂️ Introduce me to Kevin \
                    \n🎓 What degree does he have ? \
                    \n🚀 What are his latest works ? \
                    \n👨🏻‍💻 What are his professional experiences ? \
                    \n🔥 What are his hobbies ? \
                    \n🙋🏻‍♂️ How can I contact him ?" ;
    return text;
}

function general_introduction_message(){
    var text = "Kevin is a Data Science student preparing an engineering Master Degree at ESILV. \
                    \nTo know more about his skills you can ask: « What are his skills? »";
    return text;
}

function pro_programming_language_message(){
    var text = "Kevin knows Python, C#, R, JavaScript and some HTML, CSS";
    return text;
}

function pro_education_message(){
    var text ="He is currently studying at ESILV, preparing a Master Degree in Engrineering for Data Science and Artificial Intelligence.";
    return text;
}

function personal_hobbies_message(){
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title":"Kevin Lim @keke.lim",
                        "image_url": "http://kevinlim.fr/wp-content/uploads/2021/03/DSC0688_low.jpg",
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://instagram.com/keke.lim",
                                "title": "Visit profile",
                            }
                        ]
                    }
                ]
            }
        }
    }
    return response;
}

let getProject = async(sender_psid)=>{
    const octokit = new Octokit({ auth: `9bb992c8c7dd88dbd26b68a0619c8bbe9ab45e1a` });
    let rep = await octokit.request('GET /user/starred');
    var sentence = ""
    for (var item of rep.data)
    {
        var mess = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": item["name"],
                            "subtitle": item["description"],
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": item["html_url"],
                                    "title": "Visit this project"
                                }
                            ]
                        }
                    ]
                }
            }
        }
        callSendAPI("image",sender_psid, mess);
    }
}

function personal_hobbies_message2(){
    var text = "Kevin's hobbie is Photography. He enjoys taking pictures of people and landscapes. \
    \nYou can check his instagram account @keke.lim";
    return text;
}

function general_bye_message(){
    var text = "I hope you enjoyed talking to me, feel free to reach Kevin to ask him questions personally. \
    \nHe will be glad to get to know you. \
    \nYou can get his contact info by asking me: How can I contact him ? ";
    return text;
}

function professinnal_experiences_message(){
    var text = "He is currently working for Banque Populaire du Nord.\
    \nHis mission is to develop and deploy a Recommandation system for Banking products. You can learn more about this experience by contacting him. \
    \nIf you want to see his other experiences, you can visit his profile at: \
    \nhttps://linkedin.com/in/kevinlim-fr/";
    return text;
}

function general_contact_message(){
    var text = "You can reach Kevin by \
    \nEmail : kevinlim@live.fr \
    \nPhone : +33 6 51 09 55 95 \
    \nLinkedin : https://linkedin.com/in/kevinlim-fr/";
    return text;
}

function general_languages_message(){
    var text = "Kevin can know French English and Chinese \
    \nHis native language is French. \
    \nHe has acquired a B2 level in English. (TOEFL B2 2018) \
    \nHe has a B1 conversational level of Chinese. " ;
    return text;
}

function personal_age_message(){
    var birthday = new Date('1999-03-23')
    var ageDifMs = Date.now() - birthday
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    var age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return "That is a silly question. Kevin is " + age + " years old.";
}

function pro_skills_message(){
    var text = "Kevin can apply his knowledge and skills to work on new and innovative projects in Data Science. \
    \nHe knows about Big Data, noSQL and JSON type format. He can build and query databases. \
    \nHe enjoys working on a Jupyter Lab environment, processing data and building Machine Learning algorithms. \
    \nHe wants to work with Data Scientists and Software Developers to innovate in companies using Data Science.";
    return text;
}