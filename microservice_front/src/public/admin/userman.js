document
  .getElementById("createUserForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      body: new URLSearchParams([...formData]),
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    alert(JSON.stringify(data));
  });
