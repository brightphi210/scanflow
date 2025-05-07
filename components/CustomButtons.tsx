import { Pressable, Text, TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface ButtonProps {
    text: string;
    onPress?: () => void;
}
export const SolidButton = ({text, onPress, ...props}: ButtonProps)=>{
    return (
        <TouchableOpacity {...props} onPress={onPress} className="flex items-center gap-4 bg-[#2958FF] p-4 w-full rounded-lg">
            <Text className="text-white" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </TouchableOpacity>
    )
}

export const SolidButtonDisable = ({text, onPress}: ButtonProps)=>{
    return (
        <Pressable className="flex items-center gap-4  bg-[#0b1b5e] p-4 w-full rounded-lg">
            <Text className="text-blue-900" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </Pressable>
    )
}

export const BorderButton = ({text, onPress}: ButtonProps)=>{
    return (
        <TouchableOpacity onPress={onPress} className="flex items-center gap-4 border-2 border-[#2958FF] bg-transparent p-4 w-full rounded-lg">
            <Text className="text-white" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </TouchableOpacity>
    )
}

export const BorderButtonDisable = ({text}: ButtonProps)=>{
    return (
        <Pressable className="flex items-center gap-4 border-2 border-[#13245f] bg-transparent p-4 w-full rounded-lg">
            <Text className="text-[#13245f]" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </Pressable>
    )
}

export const SolidButtonArrow = ({text, onPress}: ButtonProps)=>{
    return (
        <TouchableOpacity onPress={onPress} className="flex flex-row justify-center items-center gap-4 bg-[#2958FF] p-5 w-full rounded-lg">
            <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
            <Ionicons name="chevron-forward" color={"white"} size={16} />
        </TouchableOpacity>
    )
}

export const SolidButtonArrowLeft = ({text, onPress}: ButtonProps)=>{
    return (
        <TouchableOpacity onPress={onPress} className="flex flex-row justify-center items-center gap-4 bg-[#2958FF] p-5 w-full rounded-lg">
            <MaterialIcons name="arrow-back" color={"white"} size={16} />
            <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </TouchableOpacity>
    )
}

export const SolidWhiteButtonArrowLeft = ({text, onPress}: ButtonProps)=>{
    return (
        <TouchableOpacity onPress={onPress} className="flex flex-row justify-center items-center gap-4 bg-white p-5 w-full rounded-lg">
            <MaterialIcons name="arrow-back" color={"#2958FF"} size={16} />
            <Text className="text-[#2958FF] text-sm" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </TouchableOpacity>
    )
}


export const SolidButtonGreenArrowLeft = ({text, onPress}: ButtonProps)=>{
    return (
        <TouchableOpacity onPress={onPress} className="flex flex-row justify-center items-center gap-4 bg-green-600 p-5 w-full rounded-lg">
            <Text className="text-white text-sm" style={{fontFamily: 'Poppins_500Medium'}}>{text}</Text>
        </TouchableOpacity>
    )
}




