<template>
  <div>
    <h1>dashbord</h1>
    <h5>
      Email:
      {{ $auth.user.email }}
    </h5>

    <h4>profile image</h4>
    <div>
      <img
        :src="`http://localhost:4044/static/upload/${profileimage} `"
        alt="image"
        class="profileimg"
      />
    </div>
    <button @click="remove">
      remove the profileimage
    </button>
    <div v-if="$auth.loggedIn">
      <h5>
        <button @click="$auth.logout()">
          logout
        </button>
      </h5>
    </div>
    <h5>
      <button>
        <NuxtLink to="./userlist">
          user list
        </NuxtLink>
      </button>
    </h5>
    <h5>
      <input type="file" @change="handleFileChange" />
      <button @click="upload">Upload</button>
    </h5>
  </div>
</template>

<script>
export default {
  middleware: "auth-dashboard",
  head: {
    title: "dashboard"
  },
  data() {
    return {
      file: null,
      profileimage: "",
      key: this.$auth.user.key
    };
  },
  async fetch() {
    const response = await this.$axios.$get("auth");
    this.profileimage = response.profileimage;
  },
  methods: {
    handleFileChange(event) {
      this.file = event.target.files[0];
    },
    async upload() {
      const formData = new FormData();
      formData.append("profile", this.file);
      formData.append("key", this.key);
      this.$axios
        .post("/profile", formData)
        .then(response => {
          console.log(response.data);
          this.profileimage = response.data.filename;
          console.log(this.key);
          console.log(this.profileimage);
        })
        .catch(error => {
          console.error(error);
          // Handle the error as needed
        });
    },
    async remove() {
      try {
        const response = await this.$axios.$post("/profiledelete", {
          Headers: {
            key: this.key
          }
        });
        this.msg = `${response.msg}`;
        this.refresh();
      } catch (error) {
        this.msg = `${error.response.data.msg}`;
      }
    },
    async refresh() {
      const response = await this.$axios.$get("auth");
      this.profileimage = response.profileimage;
    }
  }
};
</script>

<style scoped>
.profileimg {
  width: 200px;
  height: auto;
  border: 1px solid rgb(193, 183, 183);
}
</style>
