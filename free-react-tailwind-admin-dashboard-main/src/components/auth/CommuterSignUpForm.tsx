import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import useAuth from "../../hooks/useAuth";

export default function CommuterSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    school_name: ""
  });
  
  const { register, error, isLoading } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    
    await register(formData);
    // Navigation is handled in the Auth context
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 mb-4 text-sm font-medium text-white rounded-lg bg-error-500">
          {error}
        </div>
      )}
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* First Name */}
          <div className="sm:col-span-1">
            <Label>
              First Name<span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          {/* Last Name */}
          <div className="sm:col-span-1">
            <Label>
              Last Name<span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>
        
        {/* School Name - Specific to commuters */}
        <div>
          <Label>
            School Name<span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            id="school_name"
            name="school_name"
            value={formData.school_name}
            onChange={handleChange}
            placeholder="Enter your school name"
            required
          />
        </div>
        
        {/* Email */}
        <div>
          <Label>
            Email<span className="text-error-500">*</span>
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        {/* Password */}
        <div>
          <Label>
            Password<span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </span>
          </div>
        </div>
        
        {/* Checkbox */}
        <div className="flex items-center gap-3">
          <Checkbox
            className="w-5 h-5"
            checked={acceptTerms}
            onChange={setAcceptTerms}
          />
          <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
            By creating an account means you agree to the{" "}
            <span className="text-gray-800 dark:text-white/90">
              Terms and Conditions,
            </span>{" "}
            and our{" "}
            <span className="text-gray-800 dark:text-white">
              Privacy Policy
            </span>
          </p>
        </div>
        
        {/* Button */}
        <div>
          <button 
            type="submit"
            disabled={isLoading || !acceptTerms}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-400"
          >
            {isLoading ? "Creating Account..." : "Create Commuter Account"}
          </button>
        </div>
      </div>
    </form>
  );
}