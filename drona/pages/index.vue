<template>
  <div>
    <h1>hello</h1>
    <b-button variant="danger">Button</b-button>
    <img src="../static/icon.png" alt="" />
    <h1>
      <NuxtLink to="login">
        login
      </NuxtLink>
    </h1>
    <h1>
      <NuxtLink to="register">
        register
      </NuxtLink>
    </h1>
    <h5></h5>
  </div>
</template>

<script>
export default {
  name: "IndexPage"
};
</script>
