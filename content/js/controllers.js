/*================   ADDING CONTROLLER   ===================*/
// app.controller('myCtrl', function ($s) {
//     $s.firstName = 'John';
//     $s.lastName = 'Elia'
// })


// app.controller('product', ($s)=>{
//     $s.name = 'Product',
//     $s.price = '45 USD'
//     $s.changeName = function(){
//         $s.name = 'Cart'
//     }
// })



angular.module('myApp')
    .controller('myCtrl', function ($scope) {
        $scope.firstName = 'John';
        $scope.lastName = 'Elia';
    })
    .controller('product', function ($scope) {
        $scope.name = 'Product';
        $scope.price = '45 USD';
        $scope.arr = [];

        $scope.changeName = function () {
            // debugger
            $scope.name = 'Cart';
            let count = 0;
            $scope.arr.push(++count)
        };
    });
