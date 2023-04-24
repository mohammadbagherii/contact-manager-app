import {  useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { ContactContext } from "./context/contactContext";
import {useImmer} from "use-immer";
import { ToastContainer , toast } from 'react-toastify';
// import toast ,{Toaster} from 'react-hot-toast'
import _ from 'lodash';

import {
  AddContact,
  ViewContact,
  Contacts,
  EditContact,
  Navbar,
} from "./components";

import {
  getAllContacts,
  getAllGroups,
  createContact,
  deleteContact,
} from "./services/contactService";

import "./App.css";
import {
  CURRENTLINE,
  FOREGROUND,
  PURPLE,
  YELLOW,
  COMMENT,
} from "./helpers/colors";

const App = () => {
  const [loading, setLoading] = useImmer(false);
  const [contacts, setContacts] = useImmer([]);
  const [filteredContacts, setFilteredContacts] = useImmer([]);
  const [groups, setGroups] = useImmer([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: contactsData } = await getAllContacts();
        const { data: groupsData } = await getAllGroups();

        setContacts(contactsData);
        setFilteredContacts(contactsData);
        setGroups(groupsData);

        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
 

  const createContactForm = async (values) => {
    try {
      setLoading((prevLoading) => !prevLoading);

      const { status  ,data} = await createContact(values);

      if (status === 201) {
        toast.success("مخاطب با موفقیت ساخته شد")
        setContacts(draft => {
          draft.push(data);
        })
        setFilteredContacts(draft => {
          draft.push(data);
        })

       setLoading((draft) => !draft);

        navigate("/contacts");
      }
    } catch (err) {
      console.log(err.message);
      setLoading((prevLoading) => !prevLoading);
    }
  };


  const confirmDelete = (contactId, contactFullname) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div
            dir="rtl"
            style={{
              backgroundColor: CURRENTLINE,
              border: `1px solid ${PURPLE}`,
              borderRadius: "1em",
            }}
            className="p-4"
          >
            <h1 style={{ color: YELLOW }}>پاک کردن مخاطب</h1>
            <p style={{ color: FOREGROUND }}>
              مطمئنی که میخوای مخاطب {contactFullname} رو پاک کنی ؟
            </p>
            <button
              onClick={() => {
                removeContact(contactId);
                onClose();
              }}
              className="btn mx-2"
              style={{ backgroundColor: PURPLE }}
            >
              مطمئن هستم
            </button>
            <button
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: COMMENT }}
            >
              انصراف
            </button>
          </div>
        );
      },
    });
  };

  const removeContact = async (contactId) => {
    const contactsBackup = [...contacts];
    try {
      setContacts(draft => draft.filter(c => c.id !== contactId));
      setFilteredContacts(draft => draft.filter(c => c.id !== contactId));

      const {status} = await deleteContact(contactId);
      toast.error("مخاطب با موفقیت حذف شد");
      if (status !== 200) {
        setContacts(contactsBackup);
        setFilteredContacts(contactsBackup);
      }
    } catch (err) {
      console.log(err.message);
      setContacts(contactsBackup)
      setFilteredContacts(contactsBackup)
    }
  };

  const contactSearch = _.debounce(query => {
    if(!query) return setFilteredContacts([...contacts ])

      setFilteredContacts(draft => draft.filter(c => c.fullname.includes(query)))
  },1000);

  return (
  <ContactContext.Provider
    value={{
      loading,
      setLoading,
      setContacts,
      contacts,
      filteredContacts,
      setFilteredContacts,
      groups,
      deleteContact: confirmDelete,
      createContact: createContactForm,
      contactSearch,
    }}
  >

    <div className="App">
      <Navbar />
      <ToastContainer rtl={true} position="top-right" theme="colored" />
      {/* <Toaster/> */}
      <Routes>
        <Route path="/" element={<Navigate to="/contacts" />} />
        <Route path="/contacts" element={ <Contacts/>}/>
        <Route path="/contacts/add" element={<AddContact/>}/>
        <Route path="/contacts/:contactId" element={<ViewContact />} />
        <Route
          path="/contacts/edit/:contactId"
          element={
            <EditContact/>
          }
          />
      </Routes>
    </div>
  </ContactContext.Provider>
  );
};

export default App;
