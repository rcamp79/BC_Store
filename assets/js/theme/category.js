import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';
import { data } from 'jquery';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
    //   

        let cartEmpty = true;
        

        var data = JSON.stringify({
            "line_items": [
            {
                "quantity": 1,
                "product_id": 112
            }
            ]
        });

        

        function createAdd(){
            var xhr = new XMLHttpRequest();
                xhr.withCredentials = true;

                xhr.addEventListener("readystatechange", function () {
                if (this.readyState === this.DONE) {
                    console.log(this.responseText);
                }
                });

                xhr.open("POST", "http://localhost:3000/api/storefront/cart");
                xhr.setRequestHeader("accept", "application/json");
                xhr.setRequestHeader("content-type", "application/json");
                xhr.setRequestHeader("x-auth-token", "e8d803uclqh3izrag8svdw9pi8nznai");

                xhr.send(data);
                
                alert("Item Added!");
                location.reload();
                

        }

        function add(cartId){
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://localhost:3000/api/storefront/cart/" + cartId + "/items",
                "method": "POST",
                "headers": {
                  "accept": "application/json",
                  "content-type": "application/json",
                  "x-auth-token": "e8d803uclqh3izrag8svdw9pi8nznai"
                },
                "processData": false,
                "data": "{\"line_items\":[{\"quantity\":1,\"product_id\":112}]}"
              }

            $.ajax(settings).done(function (response) {
                console.log(response);
                alert('Item added');
                location.reload();
                $('#specialRemoveButton').attr('display', 'inline');
              });
        }
        // Add item to the cart. If cart doesnot exist, create one and add
       $('#specialButton').on("click", function(){

        fetch('/api/storefront/cart', {
        credentials: 'include'})
        .then(res => {
            return res.json();
        })
        .then(res => {
            console.log(res);
            if(res.length < 1){
                createAdd();
              
            }else{
                add(res[0].id);
            }

            
        })
       });
    //    Delete cart
       $('#specialRemoveButton').on("click", function(){
        fetch('/api/storefront/cart', {
            credentials: 'include'})
            .then(response => {
                console.log(response);
                return response.json();
            })
            .then(response => {
                console.log(response);

                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "http://localhost:3000/api/storefront/cart/" + response[0].id,
                    "method": "DELETE",
                    "headers": {
                      "accept": "application/json",
                      "content-type": "application/json",
                      "x-auth-token": "e8d803uclqh3izrag8svdw9pi8nznai"
                    },
                    "processData": false
                  }
                  
                $.ajax(settings).done(function (response) {
                alert('Cart Deleted');
                location.reload();
                });
            })


       });





        // 
        $('#hoverImage').mouseenter(function () {
            $('#hoverImage').attr('src', 'https://cdn11.bigcommerce.com/s-7q5o8rh4d2/products/112/images/377/special2__68887.1613244152.386.513.jpg?c=1');
        });

        $('#hoverImage').mouseleave(function () {
            $('#hoverImage').attr('src', 'https://cdn11.bigcommerce.com/s-7q5o8rh4d2/products/112/images/376/special1__48371.1613244081.386.513.jpg?c=1');
        });


        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();

    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }

   
}


