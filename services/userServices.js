export const addUserCategory = async (data) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    try {
        console.log("data", requestOptions.body)
        // add url in env file - todo
      let response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL  + `/user/addUserCategory`,
        requestOptions
      );
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson && (await response.json());
      console.log("data====>", data)
      return data;
    } catch (err) {
      return err;
    }
  };