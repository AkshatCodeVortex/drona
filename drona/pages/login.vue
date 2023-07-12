<template>
  <div>
    <h1>login</h1>
    <h5>
      <NuxtLink to="./">
        back to home page
      </NuxtLink>
    </h5>
    <h5>
      <NuxtLink to="./register">
        back to register
      </NuxtLink>
    </h5>
    <form @submit.prevent="userlogin">
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
    <!-- <h3>{{ msg }}</h3> -->
  </div>
</template>

<script>
export default {
  head: {
    title: "login"
  },
  data() {
    return {
      email: "chirag@gmail.com",
      password: "123"
    };
  },
  methods: {
    async userlogin() {
      try {
        let response = await this.$auth.loginWith("local", {
          data: {
            email: this.email,
            password: this.password
          }
        });
        this.msg = `${response.msg}`;
        this.$router.push("/dashboard");
      } catch (error) {
        this.msg = `${error.response.data.msg}`;
      }
    }
  }
};
</script>

<style scoped></style>
