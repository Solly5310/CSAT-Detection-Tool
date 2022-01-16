ZD_CUSTOMER = "end-user"
const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

$(function() 
{
  // The code here initialises the zendesk session with the app
  // There are many functions which can be applied to the client variable
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '200px' });

  //client call to get the user id for the current user
  //This is the code to receive the sentiment data
  //this code connects to the ZD API to collect ticket converstaion data
  getTicketSentiment(client);
  console.log(sc);
  getTicketSubjectDetails(client);

});

 function getScore(sentence)
 {
    var sentiment = require('../node_modules/sentiment');
    var sentimentObj = new sentiment();
    var score = sentimentObj.analyze(sentence);
    return score;
 }

 function getTicketSentiment(client) 
 {
    client.get('ticket.conversation').then(
    function(data) 
    {
      var convo = data['ticket.conversation'];
      var scores = []
      var comparitiveScores = []
      for (x in convo)
      {
        //Identifies the user role
        var user = convo[x].author.role;

        //If statement will determine if it is a Zendesk customer
        if (user === ZD_CUSTOMER)
        {  
          let message = convo[x].message.content;
          //Function below removes html syntax and provides the string
          message = message.replace( /(<([^>]+)>)/ig, '');
          var customerSatisfaction = getScore(message);
          var score = customerSatisfaction.score
          var comparativeS = customerSatisfaction.comparative;
          scores.push(score)
          comparitiveScores.push(comparativeS);
        }
        
      }
      console.log(scores.length)
      if (scores.length === 0)
      {
        $("#result").append("<p>No customer response!</p>");
        return;
      }
      console.log(comparitiveScores)
      var aScore = parseInt(average(scores))
      var Satisfaction = average(comparitiveScores)
      Satisfaction = Satisfaction.toFixed(2)
      if(Satisfaction > 2)
      {
        var a = "<h1><strong>The customer is:</strong></h1>"
        var b = '<p>&#x1F60D</p>'
        $("#result").append(a);
        $("#resultImage").append(b);
      }
      else if (Satisfaction > 0 && Satisfaction < 2)
      {
        var a = "<h1><strong>The customer is:</strong></h1>"
        var b = '<p>&#x1F60a</p>'
        $("#result").append(a);
        $("#resultImage").append(b);
      }
      else if (Satisfaction === 0)
      {
        var a = "<h1><strong>The customer is:</strong></h1>"
        var b = '<p>&#xF636</p>'
        $("#result").append(a);
        $("#resultImage").append(b);
      }
      else if  (Satisfaction < 0 && Satisfaction > -2)
      {
        var a = "<h1><strong>The customer is:</strong></h1>"
        var b = '<p>&#x1F614</p>'
        $("#result").append(a);
        $("#resultImage").append(b);
      }
      else if  (Satisfaction < -2)
      {
        var a = "<h1><strong>The customer is:</strong></h1>"
        var b = '<p>&#x1F62D</p>'
        $("#result").append(a);
        $("#resultImage").append(b);
      }
      $("#scoreText").append("Score:")
      $("#score").append(aScore);
      $("#cScoreText").append("Comparative Score:")
      $("#cScore").append(Satisfaction);
      for(x in scores)
      {
        y =  parseInt(x)+1
        var t = "<td>Customer Response " + (y) + " :</td>"
        var s = "<td>" + scores[x] + "</td>"
      
        $("#responseTable").append("<tr id=\'r" + x + "\'></tr>");
        $("#r" + x).append(t, s)
      }
        /*
      var source = $("#requester-template").html();
      var template = Handlebars.compile(source);
      var html = template(Satisfaction);
      $("#content").html(html);
      */
    })
    
  }

  function getTicketSubjectDetails(client) 
  {
  client.get('ticket.subject').then(
    function(data) {
      subject=data['ticket.subject']
      console.log("The subject is: " + subject);
    })
  }