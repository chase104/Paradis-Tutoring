<script>
  import { getContext } from 'svelte';
  import { clickedTopic } from '../store.js';

  const services = getContext('services');
  let topics = [];

  services.forEach(service => {
      topics = topics.concat(service.types);
  });

  let name = '';
  let email = '';
  let topic = '';
  let message = '';
  // we need to use localStorage here because formspree redirects us
  let formSubmitted = localStorage.getItem("formSubmitted") === 'true';

  clickedTopic.subscribe(value => {
      if (value) {
          topic = value;
      }
  });

  $: topic = $clickedTopic || topic;

  $: if (formSubmitted) {
      localStorage.setItem("formSubmitted", 'true');
      setTimeout(() => {
          formSubmitted = false;
          localStorage.removeItem("formSubmitted");
      }, 10000);
  }

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


    <form class:padding-top-success={formSubmitted}  action="https://formspree.io/f/xqkrwajl"  method="POST" on:submit={handleSubmit}>
        <p class="success-msg" class:display-success={formSubmitted}>Thank you for your interest! I will contact you shortly!</p>
        <div class="label-input-container">

          <label for="name">Name </label>
        <input type="text" name="name" bind:value={name} />
        </div>
        <div class="label-input-container">
      <label for="email">Email</label>
      <input type="email" name="email"  bind:value={email} />
  </div>
  <div class="label-input-container">

      <label for="topic">Class Type</label>

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
      </div>
      <div class="label-input-container">

      <label for="message">Message</label>

      <textarea class="message" name="message" placeholder="Tell me a bit about what you're looking for" bind:value={message} rows="5"></textarea>
      </div>  
      <button type="submit">Submit</button>
    </form>
</section>
  
<style>

     #contact {
        background: linear-gradient(
      to bottom right,
      rgba(244, 244, 242, 0.9),
      rgba(244, 244, 242, 0.9)
    ),
    url("../assets/scholastic_dark.png") ;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
        min-height: 100vh;
    }
    form {
      background-color: white;
      display: flex;
      position: relative;
      padding:  20px;
      box-shadow: 1px 4px 5px  #e6e6e6;
      flex-direction: column;
      width: 400px;
      margin: 100px auto;
      transition: 0.75s;
    }
    .success-msg {
        position: absolute;
        transform: translateX(-100vw);
        top: 20px;
        margin: 0px 20px;
        right: 0;
        left: 0;
        color: black;
        border: 3px solid #4CAF50;
        padding: 8px;   background-color: white;
        transition: transform 0.75s;
    }
    .display-success {
        transform: translateX(0);
    }
    .padding-top-success{
      padding-top: 100px;
    }
    input, select, textarea, button {
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
            display: flex;
            justify-content: center;
            flex-direction: column;
    }
    .contact-title {
        color: black;
        margin-bottom: 0px !important;
    }   
    .message{
      max-width: 100%;
      min-width: 100%;
    }
    .label-input-container {
      color: black;
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    gap: 4px;
    }


  </style>