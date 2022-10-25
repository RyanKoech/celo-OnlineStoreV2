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

    uint private productsLength = 0;
    address private cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        uint price;
        uint sold;
        uint stock;
    }

    mapping (uint => Product) private products;
    mapping (address => uint) private royalty;

    // modifier to check if caller is the owner of product
    modifier onlyProductOwner(uint _index){
        require(products[_index].owner == msg.sender, "Unauthorized");
        _;
    }

    /**
        * @dev allow users to create a product on the platform
        * @notice input data needs to contain only valid values
     */
    function writeProduct(
        string calldata _name,
        string calldata _image,
        string calldata _description, 
        uint _price,
        uint _stock
    ) public {
        require(bytes(_name).length > 0, "Empty name");
        require(bytes(_image).length > 0, "Empty image");
        require(bytes(_description).length > 0, "Empty description");
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

    /**
        * @dev allow users to buy a product listed on the platform, awards Royalt points for every cUSD spent, and give 0.1 cUSD discount for every royaly points spent.
        * @param _amount is the number of products to buy
        * @notice Transaction will revert if there are not enough quantity of product in stock to fulfill the order
     */
    function buyProduct(uint _index, uint _amount, uint _royaltySpent) public payable  {
        Product storage currentProduct = products[_index];
        uint totalAmout = (currentProduct.price * _amount) - (_royaltySpent * 100000000000000000);
        require(_amount > 0, "You must buy at least one product");
        require( royalty[msg.sender] >=  _royaltySpent, "Not enought royalties");
        require(currentProduct.stock >= _amount, "Not enough in stock");
        require(currentProduct.owner != msg.sender, "You can't buy your products");
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            currentProduct.owner,
            totalAmout
          ),
          "Transfer failed."
        );
        uint newRoyaltyPoints = royalty[msg.sender] + (totalAmout / 1000000000000000000) - _royaltySpent;
        uint newSoldAmount = currentProduct.sold + _amount;
        uint newStockAmount = currentProduct.stock - _amount;
        royalty[msg.sender] = newRoyaltyPoints;
        currentProduct.sold = newSoldAmount;
        currentProduct.stock = newStockAmount;
    }
    
    function getProductsLength() public view returns (uint) {
        return (productsLength);
    }

    /**
        * @dev allow products' owners to update their stock value
     */
    function updateStock(uint _index, uint _stock) public onlyProductOwner(_index) {
        products[_index].stock = _stock;
    }

    
    /**
        * @dev allow products' owners to update the price of their products
     */
    function updatePrice(uint _index, uint _price) public onlyProductOwner(_index) {
        products[_index].price = _price;
    }

    /**
        * @dev allow users to get the amount of royalty points they have
     */
    function getRoyaltyPoints() public view returns(uint) {
        return royalty[msg.sender];
    }
}