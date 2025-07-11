// import {
//   Image,
//   Card,
//   CardFooter,
//   Button,
//   Input,
//   Switch,
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
// } from "@nextui-org/react";
// import Classify from "./Classify";
// import { Carousel } from "react-responsive-carousel";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
// import Deteksi1 from "../assets/images/components/Dekteksi1.jpeg";
// import Deteksi2 from "../assets/images/components/Deteksi2.jpeg";
// // import Deteksi3 from "../assets/images/components/Deteksi3.jpg";
// // import Deteksi4 from "../assets/images/components/Deteksi4.jpg";



// const carouselImages = [
//   {
//     src: Deteksi1.src,
//     alt: "Object Detection 1"
//   },
//   {
//     src: Deteksi2.src,
//     alt: "Object Detection 2"
//   }
//   // {
//   //   src: Deteksi3.src,
//   //   alt: "Object Detection 3"
//   // },
//   // {
//   //   src: Deteksi4.src,
//   //   alt: "Object Detection 4"
//   // }
// ];

  
//   export default function Camera1() {
//     const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
//     return (
//       <>
//         <div className="flex flex-col justify-center w-full h-full">
//           <Card radius="lg" className="border-none">
//           <div className="relative overflow-hidden rounded-inherit rounded-large">
//             <Carousel
//                 showArrows={true}
//                 showThumbs={false}
//                 infiniteLoop={true}
//                 autoPlay={true}
//                 interval={3500}
//               >
//                 {carouselImages.map((image, index) => (
//                   <div key={index}>
//                     <Image
//                       className="transform hover:scale-110 transition-transform-opacity object-cover"
//                       alt={image.alt}
//                       src={image.src}
//                       width={700}
//                       height={300}
//                     />
//                 </div>
//               ))}
//             </Carousel>
//           </div>
//           <CardFooter className="flex px-4 justify-center overflow-hidden py-2 absolute  bottom-1 w-[calc(100%_-_8px)] ml-1 z-10">
//             <Button onPress={onOpen} variant="faded" color="secondary">
//               Open Camera
//             </Button>
//             <Classify/>
//           </CardFooter>
//         </Card>
//         </div>
//         <Modal
//             isOpen={isOpen}
//             placement="center"
//             backdrop="blur"
//             onOpenChange={onOpenChange}
//             size="2xl"
//           >
//           <ModalContent>
//             {(onClose) => (
//               <>
//                 <ModalHeader className="flex flex-col gap-1">
//                   Live Camera 
//                 </ModalHeader>
//                 <ModalBody className="w-full">
//                   <>
//                     <div className="flex flex-col grid-col-2 gap-2 sm:flex-row justify-center max-w-screen-xl">
//                       <Card isFooterBlurred radius="lg" className="p-4 border-none">
//                         <div className="relative overflow-hidden rounded-inherit rounded-large">
//                           <Image
//                             className="transform transition-transform-opacity object-cover"
//                             alt="Next-Gen Hydroponics"
//                             src={Deteksi1.src}
//                             width={700}
//                             height={300}
//                           />
//                         </div>
//                         {/* <CardFooter className="justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
//                           <p className="text-tiny text-white p-2 text-center">
//                               Kamera 1
//                           </p>
//                         </CardFooter> */}
//                       </Card>
//                     </div>
//                     {/* <div className="w-full">
//                       <Classify/>
//                     </div> */}
//                   </>
//                 </ModalBody>
//                 <ModalFooter>
//                   <Button color="danger" variant="flat" onPress={onClose}>
//                     Tutup
//                   </Button>
//                 </ModalFooter>
//               </>
//             )}
//           </ModalContent>
//         </Modal>
//       </>    
//     );
//   }
  