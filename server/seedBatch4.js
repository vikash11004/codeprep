import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsPath = path.join(__dirname, 'data', 'problems.json');

const data = {
  "Intervals": [
    { title: "Insert Interval", diff: "Medium", desc: "You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval. Insert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary)." },
    { title: "Merge Intervals", diff: "Medium", desc: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input." },
    { title: "Non-overlapping Intervals", diff: "Medium", desc: "Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping." },
    { title: "Meeting Rooms", diff: "Easy", desc: "Given an array of meeting time intervals where intervals[i] = [starti, endi], determine if a person could attend all meetings." },
    { title: "Meeting Rooms II", diff: "Medium", desc: "Given an array of meeting time intervals intervals where intervals[i] = [starti, endi], return the minimum number of conference rooms required." },
    { title: "Minimum Number of Arrows to Burst Balloons", diff: "Medium", desc: "There are some spherical balloons taped onto a flat wall that represents the XY-plane. The balloons are represented as a 2D integer array points where points[i] = [xstart, xend] denotes a balloon whose horizontal diameter stretches between xstart and xend. Arrows can be shot up vertically at different points along the x-axis. Return the minimum number of arrows that must be shot to burst all balloons." },
    { title: "Interval List Intersections", diff: "Medium", desc: "You are given two lists of closed intervals, firstList and secondList, where firstList[i] = [starti, endi] and secondList[j] = [startj, endj]. Each list of intervals is pairwise disjoint and in sorted order. Return the intersection of these two interval lists." },
    { title: "Data Stream as Disjoint Intervals", diff: "Hard", desc: "Given a data stream input of non-negative integers a1, a2, ..., an, summarize the numbers seen so far as a list of disjoint intervals." },
    { title: "Employee Free Time", diff: "Hard", desc: "We are given a list schedule of employees, which represents the working time for each employee. Each employee has a list of non-overlapping Intervals, and these intervals are in sorted order. Return the list of finite intervals representing common, positive-length free time for all employees, also in sorted order." },
    { title: "Find Right Interval", diff: "Medium", desc: "You are given an array of intervals, where intervals[i] = [starti, endi] and each starti is unique. The right interval for an interval i is an interval j such that startj >= endi and startj is minimized. Return an array of right interval indices for each interval i." },
    { title: "Count of Smaller Numbers After Self", diff: "Hard", desc: "Given an integer array nums, return an integer array counts where counts[i] is the number of smaller elements to the right of nums[i]." },
    { title: "Minimum Interval to Include Each Query", diff: "Hard", desc: "You are given a 2D integer array intervals, where intervals[i] = [lefti, righti] describes the ith interval starting at lefti and ending at righti (inclusive). The size of an interval is defined as the number of integers it contains, or more formally righti - lefti + 1. You are also given an integer array queries. The answer to the jth query is the size of the smallest interval i such that lefti <= queries[j] <= righti. If no such interval exists, the answer is -1. Return an array containing the answers to the queries." },
    { title: "My Calendar I", diff: "Medium", desc: "You are implementing a program to use as your calendar. We can add a new event if adding the event will not cause a double booking. A double booking happens when two events have some non-empty intersection." },
    { title: "My Calendar II", diff: "Medium", desc: "You are implementing a program to use as your calendar. We can add a new event if adding the event will not cause a triple booking. A triple booking happens when three events have some non-empty intersection." },
    { title: "My Calendar III", diff: "Hard", desc: "A k-booking happens when k events have some non-empty intersection. Write a program to add an event and return the maximum k-booking that occurred among all events." },
    { title: "Video Stitching", diff: "Medium", desc: "You are given a series of video clips from a sporting event that lasted time seconds. These video clips can be overlapping with each other and have varying lengths. Each video clip is described by an array clips where clips[i] = [starti, endi] indicates that the ith clip started at starti and ended at endi. Return the minimum number of clips needed so that we can cut the clips into segments that cover the entire sporting event [0, time]." },
    { title: "Range Module", diff: "Hard", desc: "A Range Module is a module that tracks ranges of numbers. Design a data structure to track the ranges represented as half-open intervals and query about them." },
    { title: "Partition Labels", diff: "Medium", desc: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Note that the partition is done so that after concatenating all the parts in order, the resultant string should be s. Return a list of integers representing the size of these parts." },
    { title: "Car Pooling", diff: "Medium", desc: "There is a car with capacity empty seats. The vehicle only drives east. You are given the integer capacity and an array trips where trips[i] = [numPassengersi, fromi, toi] indicates that the ith trip has numPassengersi passengers and the locations to pick them up and drop them off are fromi and toi respectively. Return true if it is possible to pick up and drop off all passengers for all the given trips, or false otherwise." },
    { title: "Maximum Profit in Job Scheduling", diff: "Hard", desc: "We have n jobs, where every job is scheduled to be done from startTime[i] to endTime[i], obtaining a profit of profit[i]. You're given the startTime, endTime and profit arrays, return the maximum profit you can take such that there are no two jobs in the subset with overlapping time range." },
    { title: "Remove Covered Intervals", diff: "Medium", desc: "Given an array intervals where intervals[i] = [li, ri] represent the interval [li, ri), remove all intervals that are covered by another interval in the list. The interval [a, b) is covered by the interval [c, d) if and only if c <= a and b <= d. Return the number of remaining intervals." },
    { title: "Maximum Length of Pair Chain", diff: "Medium", desc: "You are given an array of n pairs pairs where pairs[i] = [lefti, righti] and lefti < righti. A pair p2 = [c, d] follows a pair p1 = [a, b] if b < c. A chain of pairs can be formed in this fashion. Return the length longest chain which can be formed." },
    { title: "Add Bold Tag in String", diff: "Medium", desc: "You are given a string s and an array of strings words. You should add a closed pair of bold tag <b> and </b> to wrap the substrings in s that exist in words. If two such substrings overlap, you should wrap them together with only one pair of closed bold-tag. If two substrings wrapped by bold tags are consecutive, you should combine them." },
    { title: "Amount of New Area Painted Each Day", diff: "Hard", desc: "There is a long and thin painting that can be represented by a number line. You are given a 0-indexed 2D integer array paint of length n, where paint[i] = [starti, endi]. This means that on the ith day you need to paint the area between starti and endi. Return an array work of length n, where work[i] is the amount of new area that you painted on the ith day." },
    { title: "Average Time of Process per Machine", diff: "Easy", desc: "There is a factory website that has several machines each running the same number of processes. Write an SQL query to find the average time each machine takes to complete a process." }
  ],
  "Math & Geometry": [
    { title: "Rotate Image", diff: "Medium", desc: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation." },
    { title: "Spiral Matrix", diff: "Medium", desc: "Given an m x n matrix, return all elements of the matrix in spiral order." },
    { title: "Set Matrix Zeroes", diff: "Medium", desc: "Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's. You must do it in place." },
    { title: "Happy Number", diff: "Easy", desc: "Write an algorithm to determine if a number n is happy." },
    { title: "Plus One", diff: "Easy", desc: "You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's. Increment the large integer by one and return the resulting array of digits." },
    { title: "Pow(x, n)", diff: "Medium", desc: "Implement pow(x, n), which calculates x raised to the power n (i.e., x^n)." },
    { title: "Multiply Strings", diff: "Medium", desc: "Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string. You must not use any built-in BigInteger library or convert the inputs to integer directly." },
    { title: "Detect Squares", diff: "Medium", desc: "You are given a stream of points on the X-Y plane. Design an algorithm that: Adds new points from the stream into a data structure. Duplicate points are allowed and should be treated as different points. Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an axis-aligned square with positive area." },
    { title: "Reverse Integer", diff: "Medium", desc: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0." },
    { title: "Palindrome Number", diff: "Easy", desc: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward." },
    { title: "Roman to Integer", diff: "Easy", desc: "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given a roman numeral, convert it to an integer." },
    { title: "Integer to Roman", diff: "Medium", desc: "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given an integer, convert it to a roman numeral." },
    { title: "Excel Sheet Column Title", diff: "Easy", desc: "Given an integer columnNumber, return its corresponding column title as it appears in an Excel sheet." },
    { title: "Excel Sheet Column Number", diff: "Easy", desc: "Given a string columnTitle that represents the column title as appear in an Excel sheet, return its corresponding column number." },
    { title: "Factorial Trailing Zeroes", diff: "Medium", desc: "Given an integer n, return the number of trailing zeroes in n!. Note that n! = n * (n - 1) * ... * 3 * 2 * 1." },
    { title: "Fraction to Recurring Decimal", diff: "Medium", desc: "Given two integers representing the numerator and denominator of a fraction, return the fraction in string format. If the fractional part is repeating, enclose the repeating part in parentheses." },
    { title: "Ugly Number", diff: "Easy", desc: "An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given an integer n, return true if n is an ugly number." },
    { title: "Count Primes", diff: "Medium", desc: "Given an integer n, return the number of prime numbers that are strictly less than n." },
    { title: "Rectangle Area", diff: "Medium", desc: "Given the coordinates of two rectilinear rectangles in a 2D plane, return the total area covered by the two rectangles." },
    { title: "Rectangle Overlap", diff: "Easy", desc: "An axis-aligned rectangle is represented as a list [x1, y1, x2, y2], where (x1, y1) is the coordinate of its bottom-left corner, and (x2, y2) is the coordinate of its top-right corner. Its top and bottom edges are parallel to the X-axis, and its left and right edges are parallel to the Y-axis. Two rectangles overlap if the area of their intersection is positive. To be clear, two rectangles that only touch at the corner or edges do not overlap." },
    { title: "Check If It Is a Straight Line", diff: "Easy", desc: "You are given an array coordinates, coordinates[i] = [x, y], where [x, y] represents the coordinate of a point. Check if these points make a straight line in the XY plane." },
    { title: "Max Points on a Line", diff: "Hard", desc: "Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane, return the maximum number of points that lie on the same straight line." },
    { title: "Erect the Fence", diff: "Hard", desc: "You are given an array trees where trees[i] = [xi, yi] represents the location of a tree in the garden. You are asked to fence the entire garden using the minimum length of rope as it is expensive. The garden is well fenced only if all the trees are enclosed. Return the coordinates of trees that are exactly located on the fence perimeter." },
    { title: "Valid Square", diff: "Medium", desc: "Given the coordinates of four points in 2D space p1, p2, p3 and p4, return true if the four points construct a square." },
    { title: "Valid Boomerang", diff: "Easy", desc: "Given an array points where points[i] = [xi, yi] represents a point on the X-Y plane, return true if these points are a boomerang. A boomerang is a set of three points that are all distinct and not in a straight line." }
  ],
  "Bit Manipulation": [
    { title: "Single Number", diff: "Easy", desc: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space." },
    { title: "Number of 1 Bits", diff: "Easy", desc: "Write a function that takes an unsigned integer and returns the number of '1' bits it has (also known as the Hamming weight)." },
    { title: "Counting Bits", diff: "Easy", desc: "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i." },
    { title: "Reverse Bits", diff: "Easy", desc: "Reverse bits of a given 32 bits unsigned integer." },
    { title: "Missing Number", diff: "Easy", desc: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array." },
    { title: "Sum of Two Integers", diff: "Medium", desc: "Given two integers a and b, return the sum of the two integers without using the operators + and -. " },
    { title: "Reverse Integer", diff: "Medium", desc: "Given a signed 32-bit integer x, return x with its digits reversed." },
    { title: "Power of Two", diff: "Easy", desc: "Given an integer n, return true if it is a power of two. Otherwise, return false. An integer n is a power of two, if there exists an integer x such that n == 2^x." },
    { title: "Bitwise AND of Numbers Range", diff: "Medium", desc: "Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive." },
    { title: "Single Number II", diff: "Medium", desc: "Given an integer array nums where every element appears three times except for one, which appears exactly once. Find the single element and return it." },
    { title: "Single Number III", diff: "Medium", desc: "Given an integer array nums, in which exactly two elements appear only once and all the other elements appear exactly twice. Find the two elements that appear only once. You can return the answer in any order." },
    { title: "Maximum XOR of Two Numbers in an Array", diff: "Medium", desc: "Given an integer array nums, return the maximum result of nums[i] XOR nums[j], where 0 <= i <= j < n." },
    { title: "Hamming Distance", diff: "Easy", desc: "The Hamming distance between two integers is the number of positions at which the corresponding bits are different. Given two integers x and y, return the Hamming distance between them." },
    { title: "Total Hamming Distance", diff: "Medium", desc: "The Hamming distance between two integers is the number of positions at which the corresponding bits are different. Given an integer array nums, return the sum of Hamming distances between all the pairs of the integers in nums." },
    { title: "Power of Four", diff: "Easy", desc: "Given an integer n, return true if it is a power of four. Otherwise, return false. An integer n is a power of four, if there exists an integer x such that n == 4^x." },
    { title: "Find the Difference", diff: "Easy", desc: "You are given two strings s and t. String t is generated by random shuffling string s and then add one more letter at a random position. Find the letter that was added in t." },
    { title: "Binary Watch", diff: "Easy", desc: "A binary watch has 4 LEDs on the top which represent the hours (0-11), and the 6 LEDs on the bottom represent the minutes (0-59). Each LED represents a zero or one, with the least significant bit on the right. Given an integer turnedOn which represents the number of LEDs that are currently on, return all possible times the watch could represent." },
    { title: "Convert a Number to Hexadecimal", diff: "Easy", desc: "Given an integer num, write a method to return its hexadecimal representation. For negative integers, two’s complement method is used." },
    { title: "Base 7", diff: "Easy", desc: "Given an integer num, return a string of its base 7 representation." },
    { title: "Number Complement", diff: "Easy", desc: "The complement of an integer is the integer you get when you flip all the 0's to 1's and all the 1's to 0's in its binary representation. For example, The integer 5 is \"101\" in binary and its complement is \"010\" which is the integer 2. Given an integer num, return its complement." },
    { title: "Find the Duplicate Number", diff: "Medium", desc: "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive. There is only one repeated number in nums, return this repeated number. You must solve the problem without modifying the array nums and uses only constant extra space." },
    { title: "Sort Integers by The Number of 1 Bits", diff: "Easy", desc: "You are given an integer array arr. Sort the integers in the array in ascending order by the number of 1's in their binary representation and in case of two or more integers have the same number of 1's you have to sort them in ascending order. Return the array after sorting it." },
    { title: "Divide Two Integers", diff: "Medium", desc: "Given two integers dividend and divisor, divide two integers without using multiplication, division, and mod operator. The integer division should truncate toward zero, which means losing its fractional part. Return the quotient after dividing dividend by divisor." },
    { title: "Subsets", diff: "Medium", desc: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order." },
    { title: "UTF-8 Validation", diff: "Medium", desc: "Given an integer array data representing the data, return whether it is a valid UTF-8 encoding (i.e. it translates to a sequence of valid UTF-8 encoded characters)." }
  ]
};

async function main() {
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
  console.log('Batch 4 seed complete.');
}

main();
