<script>
  let title, stars = 0, description;
  let formStatus = '';

  function setStars(value) {
    stars = value;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      formStatus = 'Thank you for your review!';
      title = '';
      stars = 0;
      description = '';
    } else {
      formStatus = 'Oops! There was a problem submitting your review.';
    }
  }
</script>

<section class="submit-review-container">
  <h2>Write a Review</h2>

  <form action="https://formspree.io/f/xzbnydoe" class:padding-top-success={formStatus.length > 0}  method="POST" on:submit|preventDefault={handleSubmit}>
    <p class="success-msg" class:display-success={formStatus.length > 0}>{formStatus}</p>
    <label for="title">Title:</label>
    <input type="text" id="title" name="title" bind:value={title} required />
  
    <label for="stars">Stars:</label>
    <div>
      {#each Array(5) as _, i (i)}
        <button class="star-button" type="button" on:click={() => setStars(i + 1)} class:highlight={i < stars} aria-label={`Rate ${i + 1} stars`}>
          ★
        </button>
      {/each}
      <input type="hidden" name="stars" bind:value={stars} />
    </div>
  
    <label for="description">Description:</label>
    <textarea id="description" name="description" bind:value={description} required></textarea>
  
    <button class="submit-button" type="submit">Submit Review</button>
    <p>{formStatus}</p>
  </form>
</section>


<style>
  .submit-review-container{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  form {
    background-color: white;
      display: flex;
      position: relative;
      padding:  20px;
      box-shadow: 1px 4px 5px  #e6e6e6;
      flex-direction: column;
      width: 400px;
      margin: 10px auto 60px auto;
      transition: 0.75s;
  }
  form label {
    margin-top: 8px;
  }
  #description {
    max-width: 100%;
    min-width: 100%;
  }
  input, textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  .star-button {
    background: none;
    border: none;
    color: grey; 
    cursor: pointer;
    font-size: 24px;
    padding: 5px;
  }
 .submit-button {
    background: #ffeb3b;
    border: none;
    color: black;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
 }
  .highlight {
    color: #ffeb3b;
  }
  .star-button:hover {
    color: #cddc39;
  }
</style>
