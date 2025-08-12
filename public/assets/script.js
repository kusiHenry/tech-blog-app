let token = localStorage.getItem("authToken");

function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        token = data.token;

        // Notify the user
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("http://localhost:3001/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    token = null;
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
  });
}

function fetchPosts() {
  const rawUser = localStorage.getItem("loggedInUser");
  let user = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch (e) {
      console.error("Failed to parse loggedInUser", e);
    }
  }

  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("posts");
      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const isOwner = post.postedBy === user?.username;
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          <small>By: ${post.postedBy} on ${new Date(post.createdOn).toLocaleString()}</small><br>
          ${isOwner ? `
            <button onclick="editPost(${post.id})">Edit</button>
            <button onclick="deletePost(${post.id})">Delete</button>
          ` : ''}
          <hr>
        `;
        postsContainer.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Error fetching posts", error);
    });
}



function createPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;

  const rawUser = localStorage.getItem("loggedInUser");
  let user = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch (e) {
      console.error("Failed to parse loggedInUser", e);
      alert("Error: Invalid user session.");
      return;
    }
  }

  if (!user?.username) {
    alert("You're not logged in.");
    return;
  }

  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, postedBy: user.username }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      fetchPosts();
    });
}

function editPost(id) {
  const newTitle = prompt("Enter new title:");
  const newContent = prompt("Enter new content:");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!newTitle || !newContent) {
    alert("Both title and content are required.");
    return;
  }

  fetch(`http://localhost:3001/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: newTitle, content: newContent, postedBy: user.username }),
  })
    .then((res) => {
      if (res.ok) {
        alert("Post updated");
        fetchPosts();
      } else {
        alert("Failed to update post");
      }
    });
}

function deletePost(id) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  // Proceed with deletion
    fetch(`http://localhost:3001/api/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          alert("Post deleted");
          fetchPosts();
        } else {
          alert("Failed to delete post");
        }
      });
}

// Event listeners for the buttons
document.addEventListener("DOMContentLoaded", () => {
  // Bind buttons after DOM is ready
  document.getElementById("register-btn")?.addEventListener("click", register);
  document.getElementById("login-btn")?.addEventListener("click", login);
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document.getElementById("create-post-btn")?.addEventListener("click", createPost);
  document.getElementById("load-posts-btn")?.addEventListener("click", fetchPosts);

  // Check login state
  if (token && localStorage.getItem("loggedInUser")) {
    fetchPosts();
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
  } else {
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
  }
});
