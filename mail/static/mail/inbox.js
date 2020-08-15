document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  let mailboxView = document.createElement('div')
  mailboxView.id = 'mailbox-view'

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    
    // ... do something else with emails ...
    emails.forEach(element => {
      const wrapper = document.createElement('div');
      const emailDiv = document.createElement('div');
      const senderDiv = document.createElement('div');
      const subjectDiv = document.createElement('div');
      const dateDiv = document.createElement('div');
      const sender = document.createElement('span');
      const subject = document.createElement('span');
      const body = document.createElement('span');
      const date = document.createElement('span');

      senderDiv.className = "col-auto  sender-div"
      subjectDiv.className = "col subject-div"
      dateDiv.className = "col date-div text-right"

      sender.innerHTML = element.sender
      subject.innerHTML = element.subject
      body.innerHTML = element.body
      date.innerHTML = element.timestamp

      sender.className = 'sender font-weight-bold text-dark'
      subject.className = 'subject font-weight-bold font-italic text-dark'
      date.className = 'timestamp text-dark font-italic'

      senderDiv.append(sender)
      subjectDiv.append(subject)
      dateDiv.append(date)

      emailDiv.append(senderDiv)
      emailDiv.append(subjectDiv)
      emailDiv.append(dateDiv)
      // emailDiv.append(body)
      
      emailDiv.className = 'row';
      
      if(element.read) {
        wrapper.className = 'container border bg-light'
      } else {
        wrapper.className = 'container border bg-white'
      }

      

      const link = document.createElement('a')

      
      link.addEventListener('click', () => view_email(element.id))
      link.className = 'link'
    
      wrapper.append(emailDiv)
      link.append(wrapper)


      mailboxView.prepend(link);
      
    });

    document.querySelector('#emails-view').append(mailboxView)


});

  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

 
};

//send email to the recipients 
function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients, subject, body);
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);

  });

  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  load_mailbox('sent')

  return false;
};

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      document.querySelectorAll('.link').forEach(element => {
        element.style.display = 'none';
      });
      

      const wrapper = document.createElement('div');

      wrapper.id = 'view-email'

      wrapper.style.display = 'block';

      const sender = document.createElement('div');
      const subject = document.createElement('div');
      const body = document.createElement('div');
      const timestamp = document.createElement('div');

      wrapper.className = 'container' ;
      sender.innerHTML = `From: ${email.sender}`;
      subject.innerHTML = `Subject: ${email.subject}`;
      body.innerHTML = email.body;
      timestamp.innerHTML = email.timestamp;

      wrapper.append(sender);
      wrapper.append(subject);
      wrapper.append(body);
      wrapper.append(timestamp);
      if(email.sender !== document.querySelector('#user').innerHTML) {
        const replyButton = document.createElement('button');
        replyButton.id = 'reply';
        replyButton.className = 'btn-info btn';
        replyButton.innerHTML = 'Reply';
        replyButton.addEventListener('click', () => reply_email(email))
        wrapper.append(replyButton);
      }
      

      if(email.archived) {
        const archiveButton = document.createElement('button');
        archiveButton.id = 'archive';
        archiveButton.className = 'btn-primary btn';
        archiveButton.innerHTML = 'Unarchive';
        archiveButton.addEventListener('click', () => archive(email.id, false))
        wrapper.append(archiveButton);
      } else {
        const archiveButton = document.createElement('button');
        archiveButton.innerHTML = 'Archive';
        archiveButton.id = 'archive';
        archiveButton.className = 'btn-primary btn';
        archiveButton.addEventListener('click', () => archive(email.id, true))
        wrapper.append(archiveButton);
      }
      
      document.querySelector('#emails-view').append(wrapper);
      
      
  });

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}

function archive (id, bool) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: bool
    })
  })

  document.querySelector('#view-email').style.display = 'none';
  setTimeout(()  => load_mailbox('inbox'), 100);
   
}

function reply_email(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  const re = /^Re:*/;

  if (re.test(email.subject)) {
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }

  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  
}
