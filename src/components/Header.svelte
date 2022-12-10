<script>
  import NextButton from "./NextButton.svelte";


  </script>


<section class="background page-padding header-container">
    <h1 class="site-title flex-column-center">
        Paradis Tutoring
    </h1>

    <div class="flex-column-center sub-header">
        <h3 class="site-subtitle">
            Let your potential unfold
        </h3>
        <p>
            At Paradis Tutoring, we're committed to helping you excel in all aspects of English and communication. Led by Mr. Paradis, a seasoned educator with over 10 years of experience across multiple continents, our tutoring services are designed to boost your abilities and confidence in professional writing, SAT preparation, literary analysis, and public speaking.
        </p>
    </div>
    <NextButton target="#services" />
</section>

  
<style>
    .background {
        background-image: url("../assets/My_Artistic_Journey.jpg");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        height: 105vh;
        
    }
    .header-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
    .site-title {
        color: white;
        font-family: 'Cormorant+Infant', serif;
        font-size: 10rem;
        margin: 0px !important

    }
    .site-title span {
        display: block;
    }
    .sub-header {
        color: white;
        margin-left: 40px;
    }
    .sub-header h3 {
        font-size: 2rem;
        letter-spacing: 1px;
    }
  

</style>