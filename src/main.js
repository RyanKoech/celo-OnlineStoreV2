import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import marketAbi from "../contract/market.abi.json";
import erc20Abi from "../contract/erc20.abi.json";

const ERC20_DECIMALS = 18
const marketContractAddress = "0xF17F786FfD86DE07680ef3a7665CC383f24ba268"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let products = [];
let productId = 0;

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


const authModal = document.getElementById("authentication-modal");
const modal = new Modal(authModal, options);

const editModal = document.getElementById("edit-modal");
const modalEdit = new Modal(editModal, options);

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
      <a href="https://alfajores-blockscout.celo-testnet.org/address/${address}/transactions"  target="_blank">
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
        ${getEditButton(product.id, product.owner)}
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
          <span class="text-xl font-bold text-gray-900">cUSD ${product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center pt-2">
          <div class="">
            <input type="number" id="default-input" placeholder="Amount" step="1" min="1"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          <a href="#"
          id="${product.id}" class="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 btnBuy">
            Buy
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

const getProducts = async () => {
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products = []

  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readProduct(i).call()
      resolve({
        id: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        price: new BigNumber(p[4]),
        sold: p[5],
        stock: p[6],
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
  renderProducts()
}

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

async function approve(_price, _amount) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)
  const totalAmount = _price.multipliedBy(_amount);
  console.log({totalAmount, _price});
  const result = await cUSDContract.methods
    .approve(marketContractAddress, totalAmount)
    .send({ from: kit.defaultAccount })
  return result
}

const getEditButton = (id, owner) => {
  return owner == kit.defaultAccount ? 
    `
    <button
      id="${id}" class="bg-white text-gray-400 rounded-full p-2 w-fit drop-shadow-md absolute right-0 top-0 -translate-x-1/3 -translate-y-3/4 focus:ring-4 focus:outline-none focus:ring-blue-300 edit-modal" type="button">
      <svg class="w-6 h-6 authentication-modal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
        </path>
      </svg>
    </button>
    ` :
    ''
}


window.addEventListener("load", async () => {
  showNotification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  hideNotification()
});


document.querySelector("#body").addEventListener('click', e => {
  if(e.target.className.includes("authentication-modal")){
    modal.toggle();
  }
});

document.querySelector("#body").addEventListener('click', e => {
  if(e.target.className.includes("edit-modal")){
    productId = e.target.id
    modalEdit.toggle();
  }
});

document.querySelector("#body").addEventListener('click', async (e) => {
  if(e.target.className.includes("btnEdit-price")){
    modalEdit.toggle();
    try{
      const result = await contract.methods
        .updatePrice(productId ,new BigNumber(document.getElementById("edit-price").value).shiftedBy(ERC20_DECIMALS).toString())
        .send({from: kit.defaultAccount })
    }catch(error) {
      showNotification(`⚠️ ${error}.`)
    }
    showNotification(`🎉 You successfully updated "${products[productId].name} price".`);
    getProducts();
  } else if(e.target.className.includes("btnEdit-stock")){
    modalEdit.toggle();
    try{
      const result = await contract.methods
        .updateStock(productId ,document.getElementById("edit-stock").value)
        .send({from: kit.defaultAccount })
    }catch(error) {
      showNotification(`⚠️ ${error}.`)
    }
    showNotification(`🎉 You successfully updated "${products[productId].name} stock count".`);
    getProducts();
  }
})

document.querySelector("#body").addEventListener('click', async (e) => {
  if(e.target.className.includes("btnBuy")){
    const index = e.target.id
    const amount = parseInt(e.target.previousElementSibling.firstElementChild.value)
    showNotification('⌛ Waiting for payment approval...');
    try{
      await approve(products[index].price, amount)
    }catch(error) {
      showNotification(`⚠️ ${error}.`);
    }
    showNotification(`⌛ Awaiting payment for "${products[index].name}"...`)
    try {
      const result = await contract.methods
        .buyProduct(index, amount)
        .send({ from: kit.defaultAccount })
      showNotification(`🎉 You successfully bought "${products[index].name}".`)
      getProducts()
      getBalance()
    } catch (error) {
      showNotification(`⚠️ ${error}.`)
    }
  }
})

document.querySelector("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  modal.toggle();
  const newProduct = [
    document.getElementById("name").value,
    document.getElementById("image").value,
    document.getElementById("description").value,
    new BigNumber(document.getElementById("price").value).shiftedBy(ERC20_DECIMALS).toString(),
    document.getElementById("stock").value,
  ]
  try{
    const result = await contract.methods
      .writeProduct(...newProduct)
      .send({from: kit.defaultAccount })
  }catch(error) {
    showNotification(`⚠️ ${error}.`)
  }
  // products.push(newProduct);
  showNotification(`🎉 You successfully added "${newProduct[0]}".`);
  // renderProducts();
  getProducts();
});