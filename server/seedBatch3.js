import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsPath = path.join(__dirname, 'data', 'problems.json');

const data = {
  "Backtracking": [
    { title: "Subsets", diff: "Medium", desc: "Given an integer array nums of unique elements, return all possible subsets (the power set)." },
    { title: "Combination Sum", diff: "Medium", desc: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target." },
    { title: "Permutations", diff: "Medium", desc: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order." },
    { title: "Subsets II", diff: "Medium", desc: "Given an integer array nums that may contain duplicates, return all possible subsets." },
    { title: "Combination Sum II", diff: "Medium", desc: "Given a collection of candidate numbers and a target number, find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once." },
    { title: "Word Search", diff: "Medium", desc: "Given an m x n grid of characters board and a string word, return true if word exists in the grid." },
    { title: "Palindrome Partitioning", diff: "Medium", desc: "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s." },
    { title: "Letter Combinations of a Phone Number", diff: "Medium", desc: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent." },
    { title: "N-Queens", diff: "Hard", desc: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return all distinct solutions to the n-queens puzzle." },
    { title: "N-Queens II", diff: "Hard", desc: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return the number of distinct solutions to the n-queens puzzle." },
    { title: "Sudoku Solver", diff: "Hard", desc: "Write a program to solve a Sudoku puzzle by filling the empty cells." },
    { title: "Permutations II", diff: "Medium", desc: "Given a collection of numbers, nums, that might contain duplicates, return all possible unique permutations in any order." },
    { title: "Combinations", diff: "Medium", desc: "Given two integers n and k, return all possible combinations of k numbers out of the range [1, n]." },
    { title: "Combination Sum III", diff: "Medium", desc: "Find all valid combinations of k numbers that sum up to n such that only numbers 1 through 9 are used and each number is used at most once." },
    { title: "Matchsticks to Square", diff: "Medium", desc: "You are given an integer array matchsticks where matchsticks[i] is the length of the ith matchstick. You want to use all the matchsticks to make one square. Return true if you can make this square and false otherwise." },
    { title: "Splitting a String Into Descending Consecutive Values", diff: "Medium", desc: "You are given a string s that consists of only digits. Check if we can split s into two or more non-empty substrings such that the numerical values of the substrings are in descending order and the difference between numerical values of every two adjacent substrings is equal to 1." },
    { title: "Find Unique Binary String", diff: "Medium", desc: "Given an array of strings nums containing n unique binary strings each of length n, return a binary string of length n that does not appear in nums." },
    { title: "Maximum Length of a Concatenated String with Unique Characters", diff: "Medium", desc: "You are given an array of strings arr. A string s is formed by the concatenation of a subsequence of arr that has unique characters. Return the maximum possible length of s." },
    { title: "Partition to K Equal Sum Subsets", diff: "Medium", desc: "Given an integer array nums and an integer k, return true if it is possible to divide this array into k non-empty subsets whose sums are all equal." },
    { title: "Fair Distribution of Cookies", diff: "Medium", desc: "You are given an integer array cookies, where cookies[i] denotes the number of cookies in the ith bag. You are also given an integer k that denotes the number of children to distribute all the bags of cookies to. Return the minimum unfairness of all distributions." },
    { title: "Restore IP Addresses", diff: "Medium", desc: "A valid IP address consists of exactly four integers separated by single dots. Each integer is between 0 and 255 (inclusive) and cannot have leading zeros." },
    { title: "Word Pattern II", diff: "Hard", desc: "Given a pattern and a string s, return true if s matches the pattern." },
    { title: "Construct the Lexicographically Largest Valid Sequence", diff: "Medium", desc: "Given an integer n, find a sequence that satisfies all of the following: The integer 1 occurs once in the sequence. Each integer between 2 and n occurs twice in the sequence. For every integer i between 2 and n, the distance between the two occurrences of i is exactly i." },
    { title: "Find Minimum Time to Finish All Jobs", diff: "Hard", desc: "You are given an integer array jobs, where jobs[i] is the amount of time it takes to complete the ith job. There are k workers that you can assign jobs to. Each job should be assigned to exactly one worker. Return the minimum possible maximum working time of any worker." },
    { title: "Non-decreasing Subsequences", diff: "Medium", desc: "Given an integer array nums, return all the different possible non-decreasing subsequences of the given array with at least two elements." }
  ],
  "Graphs": [
    { title: "Number of Islands", diff: "Medium", desc: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands." },
    { title: "Max Area of Island", diff: "Medium", desc: "You are given an m x n binary matrix grid. An island is a group of 1's (representing land) connected 4-directionally (horizontal or vertical). Find the maximum area of an island in grid." },
    { title: "Clone Graph", diff: "Medium", desc: "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph." },
    { title: "Islands and Treasure", diff: "Medium", desc: "You are given a m x n 2D grid initialized with these three possible values: -1 - A water cell that can not be traversed. 0 - A treasure chest. INF - A land cell that can be traversed. Fill each land cell with the distance to its nearest treasure chest." },
    { title: "Rotting Oranges", diff: "Medium", desc: "You are given an m x n grid where each cell can have one of three values: 0 representing an empty cell, 1 representing a fresh orange, or 2 representing a rotten orange. Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no cell has a fresh orange." },
    { title: "Pacific Atlantic Water Flow", diff: "Medium", desc: "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges. Find the coordinates that can reach both." },
    { title: "Surrounded Regions", diff: "Medium", desc: "Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'. A region is captured by flipping all 'O's into 'X's in that surrounded region." },
    { title: "Course Schedule", diff: "Medium", desc: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses." },
    { title: "Course Schedule II", diff: "Medium", desc: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return the ordering of courses you should take to finish all courses." },
    { title: "Graph Valid Tree", diff: "Medium", desc: "You have a graph of n nodes labeled from 0 to n - 1. You are given an integer n and a list of edges where edges[i] = [ai, bi] indicates that there is an undirected edge between nodes ai and bi in the graph. Return true if the edges of the given graph make up a valid tree, and false otherwise." },
    { title: "Number of Connected Components in an Undirected Graph", diff: "Medium", desc: "You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph. Return the number of connected components in the graph." },
    { title: "Redundant Connection", diff: "Medium", desc: "In this problem, a tree is an undirected graph that is connected and has no cycles. You are given a graph that started as a tree with n nodes labeled from 1 to n, with one additional edge added. Return an edge that can be removed so that the resulting graph is a tree of n nodes." },
    { title: "Word Ladder", diff: "Hard", desc: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter. Return the length of the shortest transformation sequence." },
    { title: "Snakes and Ladders", diff: "Medium", desc: "You are given an n x n integer matrix board where the cells are labeled from 1 to n^2 in a Boustrophedon style starting from the bottom left of the board. Find the least number of moves required to reach the square n^2." },
    { title: "Open the Lock", diff: "Medium", desc: "You have a lock in front of you with 4 circular wheels. Each wheel has 10 slots: '0' to '9'. Given a list of deadends, meaning if the lock displays any of these codes, the wheels of the lock will stop turning, find the minimum number of turns to reach the target." },
    { title: "Find Eventual Safe States", diff: "Medium", desc: "There is a directed graph of n nodes with each node labeled from 0 to n - 1. A node is a terminal node if there are no outgoing edges. A node is a safe node if every possible path starting from that node leads to a terminal node (or another safe node). Return an array containing all the safe nodes of the graph." },
    { title: "Shortest Path in Binary Matrix", diff: "Medium", desc: "Given an n x n binary matrix grid, return the length of the shortest clear path in the matrix. If there is no clear path, return -1. A clear path is a path from the top-left cell to the bottom-right cell such that all visited cells are 0." },
    { title: "Network Delay Time", diff: "Medium", desc: "You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi), where ui is the source node, vi is the target node, and wi is the time it takes for a signal to travel from source to target. Return the minimum time it takes for all the n nodes to receive the signal." },
    { title: "Min Cost to Connect All Points", diff: "Medium", desc: "You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the manhattan distance between them. Return the minimum cost to make all points connected." },
    { title: "Swim in Rising Water", diff: "Hard", desc: "You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point (i, j). At time t, the depth of the water everywhere is t. Return the least time until you can reach the bottom right square." },
    { title: "Alien Dictionary", diff: "Hard", desc: "There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you. You are given a list of strings words from the alien language's dictionary, where the strings in words are sorted lexicographically by the rules of this new language. Return a string of the unique letters in the new alien language sorted in lexicographically increasing order." },
    { title: "Reconstruct Itinerary", diff: "Hard", desc: "You are given a list of airline tickets where tickets[i] = [fromi, toi] represent the departure and the arrival airports of one flight. Reconstruct the itinerary in order and return it." },
    { title: "Minimum Height Trees", diff: "Medium", desc: "A tree is an undirected graph in which any two vertices are connected by exactly one path. In other words, any connected graph without simple cycles is a tree. Given a tree of n nodes and a list of n - 1 edges, return a list of all MHTs' root labels." },
    { title: "Is Graph Bipartite?", diff: "Medium", desc: "There is an undirected graph with n nodes, where each node is numbered between 0 and n - 1. You are given a 2D array graph, where graph[u] is an array of nodes that node u is adjacent to. Return true if and only if it is bipartite." },
    { title: "Path with Maximum Probability", diff: "Medium", desc: "You are given an undirected graph of n nodes and a list of edges, where each edge has a probability of success. Given a start node and an end node, find the path with the maximum probability of success to go from start to end and return its success probability." }
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", diff: "Easy", desc: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?" },
    { title: "Min Cost Climbing Stairs", diff: "Easy", desc: "You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from the step with index 0, or the step with index 1. Return the minimum cost to reach the top of the floor." },
    { title: "House Robber", diff: "Medium", desc: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Return the maximum amount of money you can rob tonight without alerting the police." },
    { title: "House Robber II", diff: "Medium", desc: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Meanwhile, adjacent houses have a security system connected, and it will automatically contact the police if two adjacent houses were broken into on the same night." },
    { title: "Longest Palindromic Substring", diff: "Medium", desc: "Given a string s, return the longest palindromic substring in s." },
    { title: "Palindromic Substrings", diff: "Medium", desc: "Given a string s, return the number of palindromic substrings in it." },
    { title: "Decode Ways", diff: "Medium", desc: "A message containing letters from A-Z can be encoded into numbers using the following mapping: 'A' -> \"1\", 'B' -> \"2\", ... 'Z' -> \"26\". Given a string s containing only digits, return the number of ways to decode it." },
    { title: "Coin Change", diff: "Medium", desc: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount." },
    { title: "Maximum Product Subarray", diff: "Medium", desc: "Given an integer array nums, find a subarray that has the largest product, and return the product." },
    { title: "Word Break", diff: "Medium", desc: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words." },
    { title: "Longest Increasing Subsequence", diff: "Medium", desc: "Given an integer array nums, return the length of the longest strictly increasing subsequence." },
    { title: "Partition Equal Subset Sum", diff: "Medium", desc: "Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal." },
    { title: "Unique Paths", diff: "Medium", desc: "There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner." },
    { title: "Longest Common Subsequence", diff: "Medium", desc: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0." },
    { title: "Best Time to Buy and Sell Stock with Cooldown", diff: "Medium", desc: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may complete as many transactions as you like with the following restriction: After you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day)." },
    { title: "Coin Change II", diff: "Medium", desc: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the number of combinations that make up that amount." },
    { title: "Target Sum", diff: "Medium", desc: "You are given an integer array nums and an integer target. You want to build an expression out of nums by adding one of the symbols '+' and '-' before each integer in nums and then concatenate all the integers. Return the number of different expressions that you can build, which evaluates to target." },
    { title: "Interleaving String", diff: "Medium", desc: "Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2." },
    { title: "Edit Distance", diff: "Hard", desc: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2." },
    { title: "Burst Balloons", diff: "Hard", desc: "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. Return the maximum coins you can collect by bursting the balloons wisely." },
    { title: "Regular Expression Matching", diff: "Hard", desc: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where: '.' Matches any single character. '*' Matches zero or more of the preceding element." },
    { title: "Distinct Subsequences", diff: "Hard", desc: "Given two strings s and t, return the number of distinct subsequences of s which equals t." },
    { title: "Best Time to Buy and Sell Stock IV", diff: "Hard", desc: "You are given an integer array prices where prices[i] is the price of a given stock on the ith day, and an integer k. Find the maximum profit you can achieve. You may complete at most k transactions." },
    { title: "Maximum Alternating Subsequence Sum", diff: "Medium", desc: "The alternating sum of a 0-indexed array is defined as the sum of the elements at even indices minus the sum of the elements at odd indices. Return the maximum alternating sum of any subsequence of nums (after reindexing the elements of the subsequence)." },
    { title: "Stone Game", diff: "Medium", desc: "Alice and Bob play a game with piles of stones. There are an even number of piles arranged in a row, and each pile has a positive integer number of stones. Return true if Alice wins the game, assuming both players play optimally." }
  ],
  "Greedy": [
    { title: "Maximum Subarray", diff: "Medium", desc: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum." },
    { title: "Jump Game", diff: "Medium", desc: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise." },
    { title: "Jump Game II", diff: "Medium", desc: "You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. In other words, if you are at nums[i], you can jump to any nums[i + j] where: 0 <= j <= nums[i] and i + j < n. Return the minimum number of jumps to reach nums[n - 1]." },
    { title: "Gas Station", diff: "Medium", desc: "There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations. Given two integer arrays gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1." },
    { title: "Hand of Straights", diff: "Medium", desc: "Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards. Given an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return true if she can rearrange the cards, or false otherwise." },
    { title: "Merge Triplets to Form Target Triplet", diff: "Medium", desc: "A triplet is an array of three integers. You are given a 2D integer array triplets, where triplets[i] = [ai, bi, ci] describes the ith triplet. You are also given an integer array target = [x, y, z] that describes the triplet you want to obtain. Return true if it is possible to obtain the target triplet [x, y, z] as an element of triplets, or false otherwise." },
    { title: "Partition Labels", diff: "Medium", desc: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Note that the partition is done so that after concatenating all the parts in order, the resultant string should be s. Return a list of integers representing the size of these parts." },
    { title: "Valid Parenthesis String", diff: "Medium", desc: "Given a string s containing only three types of characters: '(', ')' and '*', return true if s is valid." },
    { title: "Non-overlapping Intervals", diff: "Medium", desc: "Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping." },
    { title: "Minimum Number of Arrows to Burst Balloons", diff: "Medium", desc: "There are some spherical balloons taped onto a flat wall that represents the XY-plane. The balloons are represented as a 2D integer array points where points[i] = [xstart, xend] denotes a balloon whose horizontal diameter stretches between xstart and xend. Arrows can be shot up vertically at different points along the x-axis. Return the minimum number of arrows that must be shot to burst all balloons." },
    { title: "Assign Cookies", diff: "Easy", desc: "Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie. Each child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child i will be content." },
    { title: "Candy", diff: "Hard", desc: "There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings. You are giving candies to these children subjected to the following requirements: Each child must have at least one candy. Children with a higher rating get more candies than their neighbors. Return the minimum number of candies you need to have to distribute the candies to the children." },
    { title: "Wiggle Subsequence", diff: "Medium", desc: "A sequence of numbers is called a wiggle sequence if the differences between successive numbers strictly alternate between positive and negative. Given an integer array nums, return the length of the longest wiggle subsequence." },
    { title: "Monotone Increasing Digits", diff: "Medium", desc: "An integer has monotone increasing digits if and only if each pair of adjacent digits x and y satisfy x <= y. Given an integer n, return the largest number that is less than or equal to n with monotone increasing digits." },
    { title: "Best Time to Buy and Sell Stock II", diff: "Medium", desc: "You are given an integer array prices where prices[i] is the price of a given stock on the ith day. On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day. Find and return the maximum profit you can achieve." },
    { title: "Queue Reconstruction by Height", diff: "Medium", desc: "You are given an array of people, people, which are the attributes of some people in a queue (not necessarily in order). Each people[i] = [hi, ki] represents the ith person of height hi with exactly ki other people in front who have a height greater than or equal to hi. Reconstruct and return the queue that is represented by the input array people." },
    { title: "Lemonade Change", diff: "Easy", desc: "At a lemonade stand, each lemonade costs $5. Customers are standing in a queue to buy from you and order one at a time (in the order specified by bills). Each customer will only buy one lemonade and pay with either a $5, $10, or $20 bill. You must provide the correct change to each customer so that the net transaction is that the customer pays $5. Return true if and only if you can provide every customer with the correct change." },
    { title: "Advantage Shuffle", diff: "Medium", desc: "You are given two integer arrays nums1 and nums2 both of the same length. The advantage of nums1 with respect to nums2 is the number of indices i for which nums1[i] > nums2[i]. Return any permutation of nums1 that maximizes its advantage with respect to nums2." },
    { title: "Boats to Save People", diff: "Medium", desc: "You are given an array people where people[i] is the weight of the ith person, and an infinite number of boats where each boat can carry a maximum weight of limit. Each boat carries at most two people at the same time, provided the sum of the weight of those people is at most limit. Return the minimum number of boats to carry every given person." },
    { title: "Task Scheduler", diff: "Medium", desc: "Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. For each unit of time, the CPU could complete either one task or just be idle." },
    { title: "Reorganize String", diff: "Medium", desc: "Given a string s, rearrange the characters of s so that any two adjacent characters are not the same. Return any possible rearrangement of s or return \"\" if not possible." },
    { title: "Minimum Deletions to Make Character Frequencies Unique", diff: "Medium", desc: "A string s is called good if there are no two different characters in s that have the same frequency. Given a string s, return the minimum number of characters you need to delete to make s good." },
    { title: "Maximum Length of Pair Chain", diff: "Medium", desc: "You are given an array of n pairs pairs where pairs[i] = [lefti, righti] and lefti < righti. A pair p2 = [c, d] follows a pair p1 = [a, b] if b < c. A chain of pairs can be formed in this fashion. Return the length longest chain which can be formed." },
    { title: "Bag of Tokens", diff: "Medium", desc: "You have an initial power of power, an initial score of 0, and a bag of tokens where tokens[i] is the value of the ith token (0-indexed). Your goal is to maximize your total score by potentially playing each token in one of two ways: face-up or face-down." },
    { title: "Minimum Swaps to Make Strings Equal", diff: "Medium", desc: "You are given two strings s1 and s2 of equal length consisting of letters \"x\" and \"y\" only. Your task is to make these two strings equal to each other. You can swap any two characters that belong to different strings, which means: swap s1[i] and s2[j]." }
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
  console.log('Batch 3 seed complete.');
}

main();
