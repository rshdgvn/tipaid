import { createContext, useContext, useState, useCallback, useEffect } from "react";

const FormContext = createContext();

export function FormProvider({ children }) {
  const [form, setForm] = useState({
    Recipe: "",
    People: "",
    Budget: "",
    Address: "",
    AddressLat: null,
    AddressLng: null,
    RecipeData: null,
  });

  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    console.log(form)
  },[])

  return (
    <FormContext.Provider value={{ form, updateForm }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
