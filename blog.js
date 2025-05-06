document.addEventListener("DOMContentLoaded", () => {
  fetchPosts();

  document.getElementById("create-post").addEventListener("submit", createPost);
  document.getElementById("update-post").addEventListener("submit", updatePost);
});

function fetchPosts() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(posts => {
      localStorage.setItem("posts", JSON.stringify(posts));
      displayPosts(posts.slice(0, 20));
    })
    .catch(err => alert("Failed to fetch posts"));
}

function displayPosts(posts) {
  const postList = document.getElementById("post-list");
  postList.innerHTML = "";

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-id", post.id);

    card.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <button onclick="getUser(${post.userId})">View User</button>
      <button onclick="editPost(${post.id})">Edit</button>
      <button onclick="deletePost(${post.id})">Delete</button>
    `;
    postList.appendChild(card);
  });
}

function createPost(e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;
  const userId = parseInt(document.getElementById("userId").value);

  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify({ title, body, userId }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(response => response.json())
    .then(post => {
      alert("Post created!");
      const posts = JSON.parse(localStorage.getItem("posts")) || [];
      post.id = Date.now();
      posts.unshift(post);
      localStorage.setItem("posts", JSON.stringify(posts));
      displayPosts(posts.slice(0, 20));
      document.getElementById("create-post").reset();
    });
}

function updatePost(e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("update-id").value);
  const title = document.getElementById("update-title").value;
  const body = document.getElementById("update-body").value;
  const userId = parseInt(document.getElementById("update-userId").value);

  fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, title, body, userId }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update post.");
      return res.json();
    })
    .then(updatedPost => {
      alert("Post updated!");

      const posts = JSON.parse(localStorage.getItem("posts")) || [];
      const index = posts.findIndex(post => post.id === id);
      if (index !== -1) {
        posts[index] = { ...posts[index], title, body, userId };
        localStorage.setItem("posts", JSON.stringify(posts));
        displayPosts(posts.slice(0, 10));
      } else {
        alert("Post not found!");
      }

      document.getElementById("update-post").reset();
    })
    .catch(err => alert(err.message));
}

function deletePost(id) {
  const confirmDelete = confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  const card = document.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.remove();
  }

  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const updatedPosts = posts.filter(post => post.id !== id);
  localStorage.setItem("posts", JSON.stringify(updatedPosts));

  alert("Post deleted!");
}

function getUser(userId) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `https://jsonplaceholder.typicode.com/users/${userId}`);
  xhr.onload = function () {
    if (xhr.status === 200) {
      const user = JSON.parse(xhr.responseText);
      sessionStorage.setItem("user", JSON.stringify(user));
      showUser(user);
    } else {
      alert("Failed to fetch user.");
    }
  };
  xhr.send();
}

function showUser(user) {
  const userInfo = document.getElementById("user-info");
  userInfo.innerHTML = `
    <strong>Name:</strong> ${user.name}<br>
    <strong>Email:</strong> ${user.email}
  `;

  document.cookie = `lastUser=${user.name}; max-age=300`;
}

function editPost(id) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === id);

  if (!post) {
    alert("Post not found!");
    return;
  }

  document.getElementById("update-id").value = post.id;
  document.getElementById("update-title").value = post.title;
  document.getElementById("update-body").value = post.body;
  document.getElementById("update-userId").value = post.userId;

  document.getElementById("update-form").scrollIntoView({ behavior: "smooth" });
  document.getElementById("update-title").focus();

  alert("Form pre-filled! You can now update the post.");
}

