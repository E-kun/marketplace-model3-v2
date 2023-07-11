window.addEventListener('DOMContentLoaded', async() =>{
  const {publishableKey} = await fetch("/config").then(r => r.json());
  const stripe = Stripe(publishableKey);

  const {clientSecret} = await fetch("/create-payment-intent", {
      method: "POST",
      headers: {
          'Content-Type': 'application/json'
      }
  }).then(r => r.json());

//   const appearance = {
//     theme: 'flat',
//     variables: {
//       fontFamily: ' "Gill Sans", sans-serif',
//       fontLineHeight: '1.5',
//       borderRadius: '10px',
//       colorBackground: '#F6F8FA',
//       colorPrimaryText: '#262626'
//     },
//     rules: {
//       '.Block': {
//         backgroundColor: 'var(--colorBackground)',
//         boxShadow: 'none',
//         padding: '12px'
//       },
//       '.Input': {
//         padding: '12px'
//       },
//       '.Input:disabled, .Input--invalid:disabled': {
//         color: 'lightgray'
//       },
//       '.Tab': {
//         padding: '10px 12px 8px 12px',
//         border: 'none'
//       },
//       '.Tab:hover': {
//         border: 'none',
//         boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
//       },
//       '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
//         border: 'none',
//         backgroundColor: '#fff',
//         boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
//       },
//       '.Label': {
//         fontWeight: '500'
//       }
//     }
//   };

//   const elements = stripe.elements({ clientSecret. appearance});
  const appearance = {
    theme: 'stripe',
    labels: 'floating'
  };
  const elements = stripe.elements({ clientSecret, appearance });  

  const addressElement = elements.create("address", {
    mode: "billing"
  });
  const paymentElement = elements.create('payment');
  const linkAuthenticationElement = elements.create("linkAuthentication");

  addressElement.mount('#address-element');
  paymentElement.mount('#payment-element');
  linkAuthenticationElement.mount("#link-authentication-element");
  paymentElement.mount("#payment-element");

  const form = document.getElementById("payment-form");
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // console.log(window.location.href);
    const {error} =  await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: window.location.href.split("?")[0] + "/complete"
        }
      })
      if(error) {
          const messages = document.getElementById("error-messages");
          messages.innerText = error.message;
      }
  })
});