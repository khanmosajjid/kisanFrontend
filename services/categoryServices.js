export const createCategory = async (data) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    try {
        console.log("data", requestOptions.body)
      let response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/createCategory",
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


  export const updateCategory = async (id, data) => {
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
        process.env.NEXT_PUBLIC_API_BASE_URL  + `/updateCategory/${id}`,
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

  export const getCategories = async (id) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    };
    try {
        console.log("data", requestOptions.body)
      let response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL  + `/getCategory`,
        requestOptions
      );
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson && (await response.json());
      console.log("data====>", data)
      return data.data;
    } catch (err) {
      return err;
    }
  };

  export const getUserCategory = async (id) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    };
    try {
        console.log("data", requestOptions.body)
      let response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL  + `/getUserCategory/${id}`,
        requestOptions
      );
      console.log("response of user Category Data")
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson && (await response.json());
      console.log("data====>", data)
      return data.data;
    } catch (err) {
      return err;
    }
  };