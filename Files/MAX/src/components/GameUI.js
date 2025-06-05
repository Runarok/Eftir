window.React = require('react');

window.GameUI = function({ echoes, level, collected, totalCollectibles }) {
  return React.createElement("div", {
    className: "flex justify-between w-full max-w-md mt-4 px-4"
  },
    React.createElement("div", {
      className: "flex flex-col items-center"
    },
      React.createElement("span", {
        className: "text-xs uppercase font-bold tracking-wider transition-colors duration-500 dark:text-gray-400 text-gray-600"
      }, "Level"),
      React.createElement("span", {
        className: "text-2xl font-bold transition-colors duration-500 dark:text-purple-400 text-blue-600"
      }, level)
    ),
    
    React.createElement("div", {
      className: "flex flex-col items-center"
    },
      React.createElement("span", {
        className: "text-xs uppercase font-bold tracking-wider transition-colors duration-500 dark:text-gray-400 text-gray-600"
      }, "Echoes"),
      React.createElement("span", {
        className: `text-2xl font-bold ${echoes <= 2 ? 'text-red-500' : 'transition-colors duration-500 dark:text-purple-400 text-blue-600'}`
      }, echoes)
    ),
    
    React.createElement("div", {
      className: "flex flex-col items-center"
    },
      React.createElement("span", {
        className: "text-xs uppercase font-bold tracking-wider transition-colors duration-500 dark:text-gray-400 text-gray-600"
      }, "Collectibles"),
      React.createElement("span", {
        className: "text-2xl font-bold transition-colors duration-500 dark:text-purple-400 text-blue-600"
      }, `${collected}/${totalCollectibles}`)
    )
  );
};
