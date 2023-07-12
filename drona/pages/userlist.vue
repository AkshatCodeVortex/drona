<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data">
          <td>*</td>
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <button @click="Removeuser($event, item.email)">
            <td>delete</td>
          </button>
        </tr>
      </tbody>
    </table>
    <button>
      <NuxtLink to="./dashboard">
        back to dashboard
      </NuxtLink>
    </button>
  </div>
  <!-- <div>
    <NuxtLink to="./login">
      back to login page
    </NuxtLink>
  </div> -->
</template>
<script>
export default {
  middleware: "auth-dashboard",
  data() {
    return {
      data: []
    };
  },
  async fetch() {
    const response = await this.$axios.$get("list");
    this.data = response.list;
  },
  methods: {
    async Removeuser(event, email) {
      if (confirm("are you want to delete the user")) {
        try {
          const response = await this.$axios.$post("delete", {
            email: email
          });
          this.refresh();
        } catch (error) {
          this.msg = `${error.response.data.msg}`;
        }
      }
    },
    async refresh() {
      const response = await this.$axios.$get("list");
      this.data = response.list;
    }
  }
};
</script>
