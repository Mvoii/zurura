import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import CommuterSignUpForm from "../../components/auth/CommuterSignUpForm";
import OperatorSignUpForm from "../../components/auth/OperatorSignUpForm";
import { Tab } from "@headlessui/react";

export default function SignUp() {
  const [selectedTab, setSelectedTab] = useState(0);
  const tabs = ["Commuter", "Matatu Operator"];

  return (
    <>
      <PageMeta
        title="Sign Up | Zurura Bus Booking System"
        description="Create your Zurura account to book buses or manage your transportation business"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create Your Account
            </h1>
            
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex p-1 mb-5 space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                {tabs.map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `w-full py-2.5 rounded-lg text-sm font-medium leading-5 transition-all
                      ${
                        selected
                          ? 'bg-brand-500 text-white shadow'
                          : 'text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <CommuterSignUpForm />
                </Tab.Panel>
                <Tab.Panel>
                  <OperatorSignUpForm />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
