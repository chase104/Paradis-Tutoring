
<script>
        import { getContext } from 'svelte';
    const services = getContext('services');
    // loop through services array and the topcis arrays and combine them all into one array
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
  
  
    function handleSubmit() {
      if (name && email && topic && message) {
        formSubmitted = true;
      } else {
        alert('Please fill in all the required fields.');
      }
    }
  </script>
  
  <style>
    form {
      display: flex;
      flex-direction: column;
      width: 300px;
      margin: 100px auto;
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
  <section id="contact">
    <h2 class="section-title contact-title">Let me know how I can help you!</h2>


    <form  action="https://formspree.io/f/xqkrwajl" method="POST" on:submit={handleSubmit}>
        {#if formSubmitted}
        <p>Thank you for your interest! I will contact you shortly!</p>
        {/if}
      <input type="text" name="name" placeholder="Name" bind:value={name} />
      <input type="email" name="email" placeholder="Email" bind:value={email} />
  
      <select name="topic" bind:value={topic}>
        <option value="">Select a class type</option>
        {#each services as service}
        <optgroup label={service.type}>
          {#each service.types as type}
            <option value={type.toLowerCase().replace(/\s+/g, '-')}>{type}</option>
          {/each}
        </optgroup>
      {/each}
        
      </select>
  
      <textarea name="message" placeholder="Tell me a bit about what you're looking for" bind:value={message} rows="5"></textarea>
      
      <button type="submit">Submit</button>
    </form>
</section>