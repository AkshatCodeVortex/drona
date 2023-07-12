export default async function({ $auth, redirect, localStorage }) {
  let user = $auth.$state.user;
  //console.log(token);
  if (!user) {
    // Redirect to the login page if the user is not authenticated
    //redirect("/login");
    redirect("login");
  }
}
