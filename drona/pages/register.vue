<template>
  <div>
    <h1>register</h1>
    <h5>
      <NuxtLink to="./login">
        back to login page
      </NuxtLink>
    </h5>
    <form @submit.prevent="register">
      <input
        v-model="name"
        type="name"
        class="form-control"
        id="exampleInputEmail1"
        aria-describedby="emailHelp"
        placeholder="name"
        required=""
      />
      <input
        type="email"
        v-model="email"
        class="form-control"
        id="exampleInputEmail1"
        aria-describedby="emailHelp"
        placeholder="email"
        required=""
      />
      <input
        type="password"
        v-model="password"
        class="form-control"
        id="exampleInputEmail1"
        aria-describedby="emailHelp"
        placeholder="password"
        required=""
      />
      <button>
        Sumbit
      </button>
    </form>
    <h3>{{ msg }}</h3>
  </div>
</template>
<script>
export default {
  head: {
    title: "register"
  },
  data() {
    return {
      name: "",
      email: "",
      password: "",
      msg: ""
    };
  },
  methods: {
    async register() {
      console.log(
        `register button pressed ${this.email} ${this.name} ${this.password}`
      );
      try {
        const response = await this.$axios.$post("register", {
          name: this.name,
          email: this.email,
          password: this.password
        });
        this.msg = `${response.msg}`;
        this.$router.push("/login");
      } catch (error) {
        this.msg = `${error.response.data.msg}`;
      }
    }
  }
};
</script>

<style scoped></style>
