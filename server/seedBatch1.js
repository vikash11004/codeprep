import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsPath = path.join(__dirname, 'data', 'problems.json');

const data = {
  "Two Pointers": [
    { title: "Valid Palindrome", diff: "Easy", desc: "Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases." },
    { title: "Two Sum II Input Array Is Sorted", diff: "Medium", desc: "Given a 1-indexed array of integers that is already sorted, find two numbers such that they add up to a specific target number." },
    { title: "3Sum", diff: "Medium", desc: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0." },
    { title: "Container With Most Water", diff: "Medium", desc: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water." },
    { title: "Trapping Rain Water", diff: "Hard", desc: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining." },
    { title: "Remove Duplicates From Sorted Array", diff: "Easy", desc: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once." },
    { title: "Remove Element", diff: "Easy", desc: "Given an integer array nums and an integer val, remove all occurrences of val in nums in-place." },
    { title: "Squares of a Sorted Array", diff: "Easy", desc: "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order." },
    { title: "Sort Colors", diff: "Medium", desc: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue." },
    { title: "4Sum", diff: "Medium", desc: "Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that: a, b, c, and d are distinct and nums[a] + nums[b] + nums[c] + nums[d] == target." },
    { title: "Valid Palindrome II", diff: "Easy", desc: "Given a string s, return true if the s can be palindrome after deleting at most one character from it." },
    { title: "Reverse String", diff: "Easy", desc: "Write a function that reverses a string. The input string is given as an array of characters s." },
    { title: "Reverse Vowels of a String", diff: "Easy", desc: "Given a string s, reverse only all the vowels in the string and return it." },
    { title: "Merge Strings Alternately", diff: "Easy", desc: "You are given two strings word1 and word2. Merge the strings by adding letters in alternating order." },
    { title: "Is Subsequence", diff: "Easy", desc: "Given two strings s and t, return true if s is a subsequence of t, or false otherwise." },
    { title: "String Compression", diff: "Medium", desc: "Given an array of characters chars, compress it using the following algorithm: Begin with an empty string s. For each group of consecutive repeating characters in chars, append the character followed by the group's length." },
    { title: "Move Zeroes", diff: "Easy", desc: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements." },
    { title: "Max Number of K-Sum Pairs", diff: "Medium", desc: "You are given an integer array nums and an integer k. In one operation, you can pick two numbers from the array whose sum equals k and remove them from the array." },
    { title: "Find the Index of the First Occurrence in a String", diff: "Easy", desc: "Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack." },
    { title: "Intersection of Two Arrays", diff: "Easy", desc: "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique." },
    { title: "Intersection of Two Arrays II", diff: "Easy", desc: "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays." },
    { title: "Two Sum Less Than K", diff: "Easy", desc: "Given an array A of integers and integer K, return the maximum S such that there exists i < j with A[i] + A[j] = S and S < K." },
    { title: "3Sum Smaller", diff: "Medium", desc: "Given an array of n integers nums and an integer target, find the number of index triplets i, j, k with 0 <= i < j < k < n that satisfy the condition nums[i] + nums[j] + nums[k] < target." },
    { title: "3Sum Closest", diff: "Medium", desc: "Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target." },
    { title: "Number of Subsequences That Satisfy the Given Sum Condition", diff: "Medium", desc: "You are given an array of integers nums and an integer target. Return the number of non-empty subsequences of nums such that the sum of the minimum and maximum element on it is less or equal to target." }
  ],
  "Sliding Window": [
    { title: "Best Time to Buy and Sell Stock", diff: "Easy", desc: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock." },
    { title: "Longest Substring Without Repeating Characters", diff: "Medium", desc: "Given a string s, find the length of the longest substring without repeating characters." },
    { title: "Longest Repeating Character Replacement", diff: "Medium", desc: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times." },
    { title: "Permutation in String", diff: "Medium", desc: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise." },
    { title: "Minimum Window Substring", diff: "Hard", desc: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window." },
    { title: "Sliding Window Maximum", diff: "Hard", desc: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position." },
    { title: "Maximum Average Subarray I", diff: "Easy", desc: "You are given an integer array nums consisting of n elements, and an integer k. Find a contiguous subarray whose length is equal to k that has the maximum average value and return this value." },
    { title: "Maximum Number of Vowels in a Substring of Given Length", diff: "Medium", desc: "Given a string s and an integer k, return the maximum number of vowel letters in any substring of s with length k." },
    { title: "Max Consecutive Ones III", diff: "Medium", desc: "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's." },
    { title: "Longest Subarray of 1s After Deleting One Element", diff: "Medium", desc: "Given a binary array nums, you should delete one element from it. Return the size of the longest non-empty subarray containing only 1's in the resulting array." },
    { title: "Subarray Product Less Than K", diff: "Medium", desc: "Given an array of integers nums and an integer k, return the number of contiguous subarrays where the product of all the elements in the subarray is strictly less than k." },
    { title: "Find All Anagrams in a String", diff: "Medium", desc: "Given two strings s and p, return an array of all the start indices of p's anagrams in s." },
    { title: "Repeated DNA Sequences", diff: "Medium", desc: "Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule." },
    { title: "Contains Duplicate II", diff: "Easy", desc: "Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k." },
    { title: "Minimum Size Subarray Sum", diff: "Medium", desc: "Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target." },
    { title: "Fruit Into Baskets", diff: "Medium", desc: "You are visiting a farm that has a single row of fruit trees arranged from left to right. You have two baskets, and each basket can only hold a single type of fruit. Return the maximum number of fruits you can pick." },
    { title: "Frequency of the Most Frequent Element", diff: "Medium", desc: "Given an integer array nums and an integer k. In one operation, you can choose an index of nums and increment the element at that index by 1. Return the maximum possible frequency of an element after performing at most k operations." },
    { title: "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", diff: "Medium", desc: "Given an array of integers nums and two integers k and threshold, return the number of sub-arrays of size k and average greater than or equal to threshold." },
    { title: "Grumpy Bookstore Owner", diff: "Medium", desc: "There is a bookstore owner that has a store open for n minutes. Every minute, some number of customers enter the store. You can use a secret technique to keep themselves not grumpy for minutes consecutive minutes." },
    { title: "Maximum Points You Can Obtain from Cards", diff: "Medium", desc: "There are several cards arranged in a row, and each card has an associated number of points. In one step, you can take one card from the beginning or from the end of the row. You have to take exactly k cards. Return the maximum score." },
    { title: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", diff: "Medium", desc: "Given an array of integers nums and an integer limit, return the size of the longest non-empty subarray such that the absolute difference between any two elements of this subarray is less than or equal to limit." },
    { title: "Minimum Operations to Reduce X to Zero", diff: "Medium", desc: "You are given an integer array nums and an integer x. In one operation, you can either remove the leftmost or the rightmost element from the array nums and subtract its value from x. Return the minimum number of operations to reduce x to exactly 0." },
    { title: "Maximum Erasure Value", diff: "Medium", desc: "You are given an array of positive integers nums and want to erase a subarray containing unique elements. Return the maximum score you can get by erasing exactly one subarray." },
    { title: "Count Number of Nice Subarrays", diff: "Medium", desc: "Given an array of integers nums and an integer k. A continuous subarray is called nice if there are k odd numbers on it. Return the number of nice sub-arrays." },
    { title: "Get Equal Substrings Within Budget", diff: "Medium", desc: "You are given two strings s and t of the same length and an integer maxCost. You want to change s to t. Changing the ith character of s to ith character of t costs |s[i] - t[i]|. Return the maximum length of a substring of s that can be changed to be the same as the corresponding substring of t." }
  ],
  "Stack": [
    { title: "Valid Parentheses", diff: "Easy", desc: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid." },
    { title: "Min Stack", diff: "Medium", desc: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time." },
    { title: "Evaluate Reverse Polish Notation", diff: "Medium", desc: "Evaluate the value of an arithmetic expression in Reverse Polish Notation." },
    { title: "Generate Parentheses", diff: "Medium", desc: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses." },
    { title: "Daily Temperatures", diff: "Medium", desc: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature." },
    { title: "Car Fleet", diff: "Medium", desc: "There are n cars going to the same destination along a one-lane road. Return the number of car fleets that will arrive at the destination." },
    { title: "Largest Rectangle in Histogram", diff: "Hard", desc: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram." },
    { title: "Next Greater Element I", diff: "Easy", desc: "The next greater element of some element x in an array is the first greater element that is to the right of x in the same array. Given two distinct 0-indexed integer arrays nums1 and nums2, where nums1 is a subset of nums2, find the next greater element for all elements in nums1." },
    { title: "Backspace String Compare", diff: "Easy", desc: "Given two strings s and t, return true if they are equal when both are typed into empty text editors. '#' means a backspace character." },
    { title: "Implement Queue using Stacks", diff: "Easy", desc: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty)." },
    { title: "Remove All Adjacent Duplicates In String", diff: "Easy", desc: "You are given a string s consisting of lowercase English letters. A duplicate removal consists of choosing two adjacent and equal letters and removing them." },
    { title: "Make The String Great", diff: "Easy", desc: "Given a string s of lower and upper case English letters. A good string is a string which doesn't have two adjacent characters s[i] and s[i + 1] where they are the same letter but one is upper-case and the other is lower-case." },
    { title: "Minimum Add to Make Parentheses Valid", diff: "Medium", desc: "A parentheses string is valid if and only if it follows certain rules. Given a parentheses string s, return the minimum number of moves required to make it valid." },
    { title: "Minimum Remove to Make Valid Parentheses", diff: "Medium", desc: "Given a string s of '(' , ')' and lowercase English characters. Your task is to remove the minimum number of parentheses ( '(' or ')', in any positions ) so that the resulting parentheses string is valid." },
    { title: "Asteroid Collision", diff: "Medium", desc: "We are given an array asteroids of integers representing asteroids in a row. For each asteroid, the absolute value represents its size, and the sign represents its direction. Find out the state of the asteroids after all collisions." },
    { title: "Decode String", diff: "Medium", desc: "Given an encoded string, return its decoded string. The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times." },
    { title: "Validate Stack Sequences", diff: "Medium", desc: "Given two integer arrays pushed and popped each with distinct values, return true if this could have been the result of a sequence of push and pop operations on an initially empty stack." },
    { title: "Online Stock Span", diff: "Medium", desc: "Design a class StockSpanner which collects daily price quotes for some stock and returns the span of that stock's price for the current day." },
    { title: "Next Greater Element II", diff: "Medium", desc: "Given a circular integer array nums (i.e., the next element of nums[nums.length - 1] is nums[0]), return the next greater number for every element in nums." },
    { title: "Remove Duplicate Letters", diff: "Medium", desc: "Given a string s, remove duplicate letters so that every letter appears once and only once. You must make sure your result is the smallest in lexicographical order among all possible results." },
    { title: "Sum of Subarray Minimums", diff: "Medium", desc: "Given an array of integers arr, find the sum of min(b), where b ranges over every (contiguous) subarray of arr. Since the answer may be large, return the answer modulo 10^9 + 7." },
    { title: "Maximal Rectangle", diff: "Hard", desc: "Given a rows x cols binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area." },
    { title: "Remove K Digits", diff: "Medium", desc: "Given string num representing a non-negative integer num, and an integer k, return the smallest possible integer after removing k digits from num." },
    { title: "132 Pattern", diff: "Medium", desc: "Given an array of n integers nums, a 132 pattern is a subsequence of three integers nums[i], nums[j] and nums[k] such that i < j < k and nums[i] < nums[k] < nums[j]. Return true if there is a 132 pattern in nums." },
    { title: "Score of Parentheses", diff: "Medium", desc: "Given a balanced parentheses string s, return the score of the string based on the following rules: '()' has score 1. AB has score A + B. (A) has score 2 * A." }
  ],
  "Binary Search": [
    { title: "Binary Search", diff: "Easy", desc: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1." },
    { title: "Search a 2D Matrix", diff: "Medium", desc: "You are given an m x n integer matrix matrix with the following two properties: Each row is sorted in non-decreasing order. The first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in matrix or false otherwise." },
    { title: "Koko Eating Bananas", diff: "Medium", desc: "Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. Return the minimum integer k such that she can eat all the bananas within h hours." },
    { title: "Find Minimum in Rotated Sorted Array", diff: "Medium", desc: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array." },
    { title: "Search in Rotated Sorted Array", diff: "Medium", desc: "Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums." },
    { title: "Time Based Key-Value Store", diff: "Medium", desc: "Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp." },
    { title: "Median of Two Sorted Arrays", diff: "Hard", desc: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays." },
    { title: "First Bad Version", diff: "Easy", desc: "You are a product manager and currently leading a team to develop a new product. Unfortunately, the latest version of your product fails the quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad." },
    { title: "Valid Perfect Square", diff: "Easy", desc: "Given a positive integer num, write a function which returns True if num is a perfect square else False." },
    { title: "Sqrt(x)", diff: "Easy", desc: "Given a non-negative integer x, return the square root of x rounded down to the nearest integer. The returned integer should be non-negative as well." },
    { title: "Guess Number Higher or Lower", diff: "Easy", desc: "We are playing the Guess Game. The game is as follows: I pick a number from 1 to n. You have to guess which number I picked." },
    { title: "Arranging Coins", diff: "Easy", desc: "You have n coins and you want to build a staircase with these coins. The staircase consists of k rows where the ith row has exactly i coins. The last row of the staircase may be incomplete." },
    { title: "Find Smallest Letter Greater Than Target", diff: "Easy", desc: "You are given an array of characters letters that is sorted in non-decreasing order, and a character target. There are at least two different characters in letters. Return the smallest character in letters that is lexicographically greater than target." },
    { title: "Search Insert Position", diff: "Easy", desc: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order." },
    { title: "Find First and Last Position of Element in Sorted Array", diff: "Medium", desc: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value." },
    { title: "Find Peak Element", diff: "Medium", desc: "A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array nums, find a peak element, and return its index." },
    { title: "Single Element in a Sorted Array", diff: "Medium", desc: "You are given a sorted array consisting of only integers where every element appears exactly twice, except for one element which appears exactly once. Find this single element that appears only once." },
    { title: "Find Right Interval", diff: "Medium", desc: "You are given an array of intervals, where intervals[i] = [starti, endi] and each starti is unique. The right interval for an interval i is an interval j such that startj >= endi and startj is minimized." },
    { title: "Capacity To Ship Packages Within D Days", diff: "Medium", desc: "A conveyor belt has packages that must be shipped from one port to another within days days. Return the least weight capacity of the ship that will result in all the packages on the conveyor belt being shipped within days days." },
    { title: "Minimum Number of Days to Make m Bouquets", diff: "Medium", desc: "You are given an integer array bloomDay, an integer m and an integer k. You want to make m bouquets. To make a bouquet, you need to use k adjacent flowers from the garden. Return the minimum number of days you need to wait to be able to make m bouquets from the garden." },
    { title: "Split Array Largest Sum", diff: "Hard", desc: "Given an integer array nums and an integer k, split nums into k non-empty subarrays such that the largest sum of any subarray is minimized. Return the minimized largest sum of the split." },
    { title: "Find Minimum in Rotated Sorted Array II", diff: "Hard", desc: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. This array may contain duplicates. Given the sorted rotated array nums that may contain duplicates, return the minimum element of this array." },
    { title: "Search in Rotated Sorted Array II", diff: "Medium", desc: "There is an integer array nums sorted in non-decreasing order (not necessarily with distinct values). Given the array nums after the rotation and an integer target, return true if target is in nums, or false if it is not in nums." },
    { title: "Count Negative Numbers in a Sorted Matrix", diff: "Easy", desc: "Given a m x n matrix grid which is sorted in non-increasing order both row-wise and column-wise, return the number of negative numbers in grid." },
    { title: "Peak Index in a Mountain Array", diff: "Medium", desc: "An array arr a mountain if the following properties hold: arr.length >= 3, There exists some i with 0 < i < arr.length - 1 such that: arr[0] < arr[1] < ... < arr[i - 1] < arr[i] and arr[i] > arr[i + 1] > ... > arr[arr.length - 1]. Given a mountain array arr, return the index i such that arr[0] < arr[1] < ... < arr[i - 1] < arr[i] > arr[i + 1] > ... > arr[arr.length - 1]." }
  ]
};

async function main() {
  console.log('Loading existing problems...');
  let problems = [];
  try {
    problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
  } catch (e) {
    console.error('Error reading problems.json:', e.message);
    process.exit(1);
  }

  const existingIds = new Set(problems.map(p => p.id));

  Object.entries(data).forEach(([category, list]) => {
    let added = 0;
    list.forEach(item => {
      const id = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!existingIds.has(id)) {
        problems.push({
          id,
          title: item.title,
          difficulty: item.diff,
          category: category,
          tags: [id.split('-')[0], category.toLowerCase().replace(/ /g, '-')],
          sourceUrl: "https://leetcode.com/problems/" + id + "/",
          description: item.desc,
          constraints: ["General constraints apply based on problem difficulty.", "Time complexity must be optimal."],
          examples: [{
            input: "Example Input",
            output: "Example Output",
            explanation: "Follow standard algorithmic logic to arrive at this output."
          }]
        });
        existingIds.add(id);
        added++;
      }
    });
    console.log("Added " + added + " problems for " + category);
  });

  fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));
  console.log('Batch 1 seed complete.');
}

main();
