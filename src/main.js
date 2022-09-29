import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import marketAbi from "../contract/market.abi.json";

const ERC20_DECIMALS = 18
const marketContractAddress = ""

let kit
let contract
const products = [
  {
    id: 1,
    owner: "0x6D7420913eCf06d53c67b97e2FC9b95E0AC917b7",
    name: "Name1",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, beatae. Consectetur ab eius illo esse nostrum quibusdam repellendus quod illum.",
    image:
      "https://cdn.shopify.com/s/files/1/0070/7032/files/trending-products_c8d0d15c-9afc-47e3-9ba2-f7bad0505b9b.png",
    price: 12,
    sold: 2,
    stock: 2,
  },
  {
    id: 2,
    owner: "0x6D7420913eCf06d53c67b97e2FC9b95E0AC917b7",
    name: "Name2",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, beatae. Consectetur ab eius illo esse nostrum quibusdam repellendus quod illum. Consectetur ab eius illo esse nostrum quibusdam repellendus.",
    image:
      "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/gh-012021-best-hair-products-1642523366.png",
    price: 12,
    sold: 2,
    stock: 2,
  },
  {
    id: 3,
    owner: "0x6D7420913eCf06d53c67b97e2FC9b95E0AC917b7",
    name: "Name3",
    description: "Lorem ipsum dolor esse nostrum quibusdam repellendus quod illum.",
    image:
      "https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1637093284-41EuH5nHVDL._SL500_.jpg",
    price: 32,
    sold: 3,
    stock: 2,
  },
];

const connectCeloWallet = async function () {
  if (window.celo) {
    showNotification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      hideNotification()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketAbi, marketContractAddress)

    } catch (error) {
      showNotification(`⚠️ ${error}.`)
    }
  } else {
    showNotification("⚠️ Please install the CeloExtensionWallet.")
  }
}

const getAddressIcon = address => {

  const icon = blockies
  .create({
    seed: address,
    size: 8,
    scale: 16,
  })
  .toDataURL()

  return `
    <div class="absolute top-0 left-0 translate-x-1/3 -translate-y-3/4">
      <a href="https://alfajores-blockscout.celo-testnet.org/address/${address}/transactions">
        <img class="rounded-full object-cover h-16 w-16 drop-shadow-md border-2 border-blue-500"
          src="${icon}" alt="${address}"
          alt="">
      </a>
    </div>
  `;
}

const getProductItem = (product) => {
  return `
      <span class="bg-white px-2 py-1 absolute top-0 right-0">
        Sold ${product.sold}
      </span>
      <img class="rounded-t-lg object-cover h-[250px] w-full"
        src="${product.image}"
        alt="product image" />
      <div class="px-5 py-5 relative">
        <button
          id="${product.id}" class="bg-white text-gray-400 rounded-full p-2 w-fit drop-shadow-md absolute right-0 top-0 -translate-x-1/3 -translate-y-3/4 focus:ring-4 focus:outline-none focus:ring-blue-300 authentication-modal" type="button">
          <svg class="w-6 h-6 authentication-modal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
            </path>
          </svg>
        </button>
        ${getAddressIcon(product.owner)}
        <a href="#">
          <h5 class="text-xl font-semibold tracking-tight text-gray-900">
            ${product.name}
          </h5>
        </a>
        <div class="text-gray h-[100px] overflow-hidden pt-2">
          ${product.description}
        </div>
        <div class="flex justify-between items-center pt-8">
          <span class="text-xl text-gray-900">${product.stock} in stock</span>
          <span class="text-xl font-bold text-gray-900">cUSD ${product.price}</span>
        </div>
        <div class="flex justify-between items-center pt-2">
          <div class="">
            <input type="number" id="default-input" placeholder="Amount" step="1" min="1"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          <a href="#"
          id="${product.id}" class="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 btnBuy">
            Buy : 1.25 cUSD
          </a>
        </div>
      </div>
  `;
};

const getBalance = async () => {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance;
};

const renderProducts = () => {
  document.querySelector("#shop-items-container").innerHTML = "";
  products.forEach((_product) => {
    const newDiv = document.createElement("div");
    newDiv.className = "w-[350px] mx-auto max-w-sm bg-white rounded-lg drop-shadow-lg relative mb-12";
    newDiv.innerHTML = getProductItem(_product);
    document.querySelector("#shop-items-container").appendChild(newDiv);
  });
};

const showNotification = (message) => {
  document.querySelector("#notification").style.display = "block";
  document.querySelector("#notification-message").textContent = message;
}

const hideNotification = () => {
  document.querySelector("#notification").style.display = "none";
}


const options = {
  onHide: () => {
      console.log('modal is hidden');
  },
  onShow: () => {
      console.log('modal is shown');
  },
  onToggle: () => {
      console.log('modal has been toggled');
  }
};

const showModal = () => {

}

const authModal = document.getElementById("authentication-modal");

const modal = new Modal(authModal, options);

window.addEventListener("load", async () => {
  showNotification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  renderProducts()
  hideNotification()
});


document.querySelector("#body").addEventListener('click', e => {
  if(e.target.className.includes("authentication-modal")){
    modal.toggle();
  }
});

document.querySelector("#body").addEventListener('click', e => {
  if(e.target.className.includes("btnBuy")){
    const index = e.target.id - 1
    const amount = parseInt(e.target.previousElementSibling.firstElementChild.value)
    // if(!isNaN(parseInt(amount))){
    //   showNotification(`Please enter a valid amount`);
    //   return
    // }
    products[index].sold = products[index].sold + amount
    products[index].stock = products[index].stock - amount
    showNotification(`🎉 You successfully bought "${products[index].name}".`);
    renderProducts();
  }
})

document.querySelector("#form").addEventListener("submit", e => {
  e.preventDefault();
  const newProduct = {
    id: 1,
    owner: "0x6D7420913eCf06d53c67b97e2FC9b95E0AC917b7",
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    image: document.getElementById("image").value,
    price: document.getElementById("price").value,
    sold: 0,
    stock: document.getElementById("stock").value,
  }
  products.push(newProduct);
  showNotification(`🎉 You successfully added "${newProduct.name}".`);
  renderProducts();
  modal.toggle();
});