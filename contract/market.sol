// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract DecentralizedMarket {

    uint internal productsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        uint price;
        uint sold;
        uint stock;
    }

    mapping (uint => Product) internal products;

    function writeProduct(
        string memory _name,
        string memory _image,
        string memory _description, 
        uint _price,
        uint _stock
    ) public {
        uint _sold = 0;
        products[productsLength] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _price,
            _sold,
            _stock
        );
        productsLength++;
    }

    function readProduct(uint _index) public view returns (
        address payable,
        string memory, 
        string memory, 
        string memory,
        uint, 
        uint,
        uint
    ) {
        return (
            products[_index].owner,
            products[_index].name, 
            products[_index].image, 
            products[_index].description, 
            products[_index].price,
            products[_index].sold,
            products[_index].stock
        );
    }

    function buyProduct(uint _index, uint _amount) public payable  {
        require(_amount >= products[_index].stock, "Not enough in stock");
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            products[_index].owner,
            products[_index].price * _amount
          ),
          "Transfer failed."
        );
        products[_index].sold = products[_index].sold + _amount;
        products[_index].stock = products[_index].stock - _amount;
    }
    
    function getProductsLength() public view returns (uint) {
        return (productsLength);
    }

    function updateStock(uint _index, uint _stock) public {
        require(products[_index].owner == msg.sender, "Unauthorized");
        products[_index].stock = _stock;
    }

    function updatePrice(uint _index, uint _price) public {
        require(products[_index].owner == msg.sender, "Unauthorized");
        products[_index].price = _price;
    }
}