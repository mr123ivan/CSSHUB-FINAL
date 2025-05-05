import React from "react";
import merch1 from "../assets/Products/merch1.jpg"
import merch2 from "../assets/Products/merch2.jpg"
import merch3 from "../assets/Products/merch3.jpg"
import merch4 from "../assets/Products/merch4.jpg"

const products = [
  {
    id: 1,
    name: "Jacket",
    image: merch1,
  },
  {
    id: 2,
    name: "T-Shirt",
    image: merch2,
  },
  {
    id: 3,
    name: "Tote Bag",
    image: merch3,
  },
  {
    id: 4,
    name: "Lanyard",
    image: merch4,
  },
];

const ProductGrid = () => {
  return (
    <section className="py-12 px-4 bg-yellow-600">
      <h2 className="text-3xl font-bold text-center mb-8">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow duration-300"
          >
            <div className="overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-72 object-cover transform transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
