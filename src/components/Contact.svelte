
<script>
        import { getContext } from 'svelte';
    const services = getContext('services');
    import {clickedTopic} from '../store.js';
    console.log(clickedTopic);
    let topics = [];
    console.log(services);

    services.forEach(service => {
        topics = topics.concat(service.types);
    });
    let name = '';
    let email = '';
    let topic = '';
    let message = '';
    let formSubmitted = false;
    $: {
        if ((!topic && $clickedTopic) ) {
            topic = $clickedTopic;
        }
    }
    clickedTopic.subscribe(value => {
        console.log({value});
        if (value.length) {
        topic = value;
        }
    })
    $: console.log({topic});

    function handleSubmit() {
      if (name && email && topic && message) {
        formSubmitted = true;
      } else {
        alert('Please fill in all the required fields.');
      }
    }
  </script>

  <section id="contact">
    <h2 class="section-title contact-title">Contact</h2>


    <form  action="https://formspree.io/f/xqkrwajl" method="POST" on:submit={handleSubmit}>
        {#if formSubmitted}
        <p class="success-msg">Thank you for your interest! I will contact you shortly!</p>
        {/if}
      <input type="text" name="name" placeholder="Name" bind:value={name} />
      <input type="email" name="email" placeholder="Email" bind:value={email} />
  
      <select name="topic" bind:value={topic}>
        <option value="">Select a class type</option>
        {#each services as service}
        <optgroup label={service.type}>
          {#each service.types as type}
            <option value={type} >{type}</option>
          {/each}
        </optgroup>
      {/each}
        
      </select>
  
      <textarea name="message" placeholder="Tell me a bit about what you're looking for" bind:value={message} rows="5"></textarea>
      
      <button type="submit">Submit</button>
    </form>
</section>
  
<style>

     #contact {
        background: linear-gradient(
      to bottom right,
      rgba(244, 244, 242, 0.85),
      rgba(244, 244, 242, 0.85)
    ),
    url("../assets/scholastic_dark.png") ;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
        min-height: 100vh;
    }
    form {
      display: flex;
      position: relative;
      padding-top: 50px;
      flex-direction: column;
      width: 400px;
      margin: 100px auto;
    }
    .success-msg {
        position: absolute;
        top: 0px;
        margin: 0px;
        
        color: black;
        border: 3px solid #4CAF50;
        padding: 8px;   background-color: white;
    }
    input, select, textarea, button {
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      cursor: pointer;
    }
    button:hover {
      opacity: 0.8;
    }
    #contact {
        height: 100vh;
            display: flex;
            justify-content: center;
            flex-direction: column;
    }
    .contact-title {
        color: black;
        margin-bottom: 0px !important;
    }   
  </style>