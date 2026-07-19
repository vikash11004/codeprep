import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsPath = path.join(__dirname, 'data', 'problems.json');

const data = {
  "Linked List": [
    { title: "Reverse Linked List", diff: "Easy", desc: "Given the head of a singly linked list, reverse the list, and return the reversed list." },
    { title: "Merge Two Sorted Lists", diff: "Easy", desc: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list." },
    { title: "Linked List Cycle", diff: "Easy", desc: "Given head, the head of a linked list, determine if the linked list has a cycle in it." },
    { title: "Reorder List", diff: "Medium", desc: "You are given the head of a singly linked-list. Reorder the list to be on the following form: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …" },
    { title: "Remove Nth Node From End of List", diff: "Medium", desc: "Given the head of a linked list, remove the nth node from the end of the list and return its head." },
    { title: "Copy List with Random Pointer", diff: "Medium", desc: "A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null. Construct a deep copy of the list." },
    { title: "Add Two Numbers", diff: "Medium", desc: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list." },
    { title: "Find the Duplicate Number", diff: "Medium", desc: "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive. There is only one repeated number in nums, return this repeated number." },
    { title: "LRU Cache", diff: "Medium", desc: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache." },
    { title: "Merge k Sorted Lists", diff: "Hard", desc: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it." },
    { title: "Reverse Nodes in k-Group", diff: "Hard", desc: "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list." },
    { title: "Palindrome Linked List", diff: "Easy", desc: "Given the head of a singly linked list, return true if it is a palindrome or false otherwise." },
    { title: "Intersection of Two Linked Lists", diff: "Easy", desc: "Given the heads of two singly linked-lists headA and headB, return the node at which the two lists intersect." },
    { title: "Remove Linked List Elements", diff: "Easy", desc: "Given the head of a linked list and an integer val, remove all the nodes of the linked list that has Node.val == val, and return the new head." },
    { title: "Remove Duplicates from Sorted List", diff: "Easy", desc: "Given the head of a sorted linked list, delete all duplicates such that each element appears only once." },
    { title: "Middle of the Linked List", diff: "Easy", desc: "Given the head of a singly linked list, return the middle node of the linked list." },
    { title: "Swap Nodes in Pairs", diff: "Medium", desc: "Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only nodes themselves may be changed.)" },
    { title: "Rotate List", diff: "Medium", desc: "Given the head of a linked list, rotate the list to the right by k places." },
    { title: "Remove Duplicates from Sorted List II", diff: "Medium", desc: "Given the head of a sorted linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list." },
    { title: "Partition List", diff: "Medium", desc: "Given the head of a linked list and a value x, partition it such that all nodes less than x come before nodes greater than or equal to x." },
    { title: "Sort List", diff: "Medium", desc: "Given the head of a linked list, return the list after sorting it in ascending order." },
    { title: "Insertion Sort List", diff: "Medium", desc: "Given the head of a singly linked list, sort the list using insertion sort, and return the sorted list's head." },
    { title: "Odd Even Linked List", diff: "Medium", desc: "Given the head of a singly linked list, group all the nodes with odd indices together followed by the nodes with even indices, and return the reordered list." },
    { title: "Swapping Nodes in a Linked List", diff: "Medium", desc: "You are given the head of a linked list, and an integer k. Return the head of the linked list after swapping the values of the kth node from the beginning and the kth node from the end (the list is 1-indexed)." },
    { title: "Reverse Linked List II", diff: "Medium", desc: "Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right, and return the reversed list." }
  ],
  "Trees": [
    { title: "Invert Binary Tree", diff: "Easy", desc: "Given the root of a binary tree, invert the tree, and return its root." },
    { title: "Maximum Depth of Binary Tree", diff: "Easy", desc: "Given the root of a binary tree, return its maximum depth." },
    { title: "Diameter of Binary Tree", diff: "Easy", desc: "Given the root of a binary tree, return the length of the diameter of the tree." },
    { title: "Balanced Binary Tree", diff: "Easy", desc: "Given a binary tree, determine if it is height-balanced." },
    { title: "Same Tree", diff: "Easy", desc: "Given the roots of two binary trees p and q, write a function to check if they are the same or not." },
    { title: "Subtree of Another Tree", diff: "Easy", desc: "Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise." },
    { title: "Lowest Common Ancestor of a Binary Search Tree", diff: "Medium", desc: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST." },
    { title: "Binary Tree Level Order Traversal", diff: "Medium", desc: "Given the root of a binary tree, return the level order traversal of its nodes' values." },
    { title: "Binary Tree Right Side View", diff: "Medium", desc: "Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom." },
    { title: "Count Good Nodes in Binary Tree", diff: "Medium", desc: "Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X. Return the number of good nodes." },
    { title: "Validate Binary Search Tree", diff: "Medium", desc: "Given the root of a binary tree, determine if it is a valid binary search tree (BST)." },
    { title: "Kth Smallest Element in a BST", diff: "Medium", desc: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree." },
    { title: "Construct Binary Tree from Preorder and Inorder Traversal", diff: "Medium", desc: "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree." },
    { title: "Binary Tree Maximum Path Sum", diff: "Hard", desc: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Return the maximum path sum of any non-empty path." },
    { title: "Serialize and Deserialize Binary Tree", diff: "Hard", desc: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree." },
    { title: "Lowest Common Ancestor of a Binary Tree", diff: "Medium", desc: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree." },
    { title: "Symmetric Tree", diff: "Easy", desc: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center)." },
    { title: "Path Sum", diff: "Easy", desc: "Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum." },
    { title: "Binary Tree Paths", diff: "Easy", desc: "Given the root of a binary tree, return all root-to-leaf paths in any order." },
    { title: "Minimum Depth of Binary Tree", diff: "Easy", desc: "Given a binary tree, find its minimum depth." },
    { title: "Sum of Left Leaves", diff: "Easy", desc: "Given the root of a binary tree, return the sum of all left leaves." },
    { title: "Binary Tree Inorder Traversal", diff: "Easy", desc: "Given the root of a binary tree, return the inorder traversal of its nodes' values." },
    { title: "Binary Tree Preorder Traversal", diff: "Easy", desc: "Given the root of a binary tree, return the preorder traversal of its nodes' values." },
    { title: "Binary Tree Postorder Traversal", diff: "Easy", desc: "Given the root of a binary tree, return the postorder traversal of its nodes' values." },
    { title: "Merge Two Binary Trees", diff: "Easy", desc: "You are given two binary trees root1 and root2. Merge the two trees into a new binary tree. The merge rule is that if two nodes overlap, then sum node values up as the new value of the merged node." }
  ],
  "Tries": [
    { title: "Implement Trie (Prefix Tree)", diff: "Medium", desc: "A trie (pronounced as 'try') or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class." },
    { title: "Design Add and Search Words Data Structure", diff: "Medium", desc: "Design a data structure that supports adding new words and finding if a string matches any previously added string." },
    { title: "Word Search II", diff: "Hard", desc: "Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells." },
    { title: "Prefix and Suffix Search", diff: "Hard", desc: "Design a special dictionary that searches the words in it by a prefix and a suffix." },
    { title: "Maximum XOR of Two Numbers in an Array", diff: "Medium", desc: "Given an integer array nums, return the maximum result of nums[i] XOR nums[j], where 0 <= i <= j < n." },
    { title: "Replace Words", diff: "Medium", desc: "In English, we have a concept called root, which can be followed by some other word to form another longer word. Given a dictionary consisting of many roots and a sentence consisting of words separated by spaces, replace all the derivatives in the sentence with the root forming it." },
    { title: "Map Sum Pairs", diff: "Medium", desc: "Design a map that allows you to do the following: Maps a string key to a given value. Returns the sum of the values that have a key with a prefix equal to a given string." },
    { title: "Search Suggestions System", diff: "Medium", desc: "You are given an array of strings products and a string searchWord. Design a system that suggests at most three product names from products after each character of searchWord is typed." },
    { title: "Longest Word in Dictionary", diff: "Medium", desc: "Given an array of strings words representing an English Dictionary, return the longest word in words that can be built one character at a time by other words in words." },
    { title: "Short Encoding of Words", diff: "Medium", desc: "A valid encoding of an array of words is any reference string s and array of indices indices such that: words.length == indices.length, the reference string s ends with the '#' character, and for each index indices[i], the substring of s starting from indices[i] and up to (but not including) the next '#' character is equal to words[i]. Return the length of the shortest reference string s possible of any valid encoding." },
    { title: "Stream of Characters", diff: "Hard", desc: "Design a class StreamChecker that is initialized with a list of words and supports the method query(letter) which returns true if any of the words is a suffix of the characters queried so far." },
    { title: "Camelcase Matching", diff: "Medium", desc: "Given an array of strings queries and a string pattern, return a boolean array answer where answer[i] is true if queries[i] matches pattern, and false otherwise." },
    { title: "Word Squares", diff: "Hard", desc: "Given an array of unique strings words, return all the word squares you can build from words. A sequence of strings forms a valid word square if the kth row and column read the exact same string." },
    { title: "Palindrome Pairs", diff: "Hard", desc: "Given a list of unique words, return all the pairs of the distinct indices (i, j) in the given list, so that the concatenation of the two words words[i] + words[j] is a palindrome." },
    { title: "Maximum Genetic Difference Query", diff: "Hard", desc: "There is a rooted tree consisting of n nodes numbered 0 to n - 1. Each node's number denotes its unique genetic value (i.e., inside that node is a value equal to its number). You are given a 2D array queries where queries[i] = [nodei, vali]. For each query, find the maximum bitwise XOR of vali and p's value, where p is any node on the path from root to nodei." },
    { title: "Count Words Obtained After Adding a Letter", diff: "Medium", desc: "You are given two 0-indexed arrays of strings startWords and targetWords. Each string consists of lowercase English letters only. Return the number of strings in targetWords that can be obtained by performing the operations on any string of startWords." },
    { title: "Find All Good Strings", diff: "Hard", desc: "Given the strings s1 and s2 of length n and a string evil, return the number of good strings. A good string has size n, is alphabetically greater than or equal to s1, alphabetically smaller than or equal to s2, and does not contain the string evil as a substring." },
    { title: "Design Excel Sum Formula", diff: "Hard", desc: "Design the basic function of Excel and implement the function of sum formula." },
    { title: "Implement Magic Dictionary", diff: "Medium", desc: "Design a data structure that is initialized with a list of different words. Provided a string, you should determine if you can change exactly one character in this string to match any word in the data structure." },
    { title: "Concatenated Words", diff: "Hard", desc: "Given an array of strings words (without duplicates), return all the concatenated words in the given list of words. A concatenated word is defined as a string that is comprised entirely of at least two shorter words in the given array." },
    { title: "Delete Duplicate Folders in System", diff: "Hard", desc: "Due to a bug, there are many duplicate folders in a file system. You are given a 2D array paths, where paths[i] is an array representing an absolute path to the ith folder in the file system. Return the 2D array representing the paths of the remaining folders after deleting all the duplicate folders." },
    { title: "Prefix and Suffix Search II", diff: "Hard", desc: "Design a special dictionary that searches the words in it by a prefix and a suffix." },
    { title: "Index Pairs of a String", diff: "Easy", desc: "Given a string text and an array of strings words, return an array of all index pairs [i, j] so that the substring text[i...j] is in words." },
    { title: "Bold Words in String", diff: "Medium", desc: "Given a set of keywords words and a string s, make all appearances of all keywords words[i] in s bold. Any letters between <b> and </b> tags become bold." },
    { title: "Lexicographical Numbers", diff: "Medium", desc: "Given an integer n, return all the numbers in the range [1, n] sorted in lexicographical order." }
  ],
  "Heap / Priority Queue": [
    { title: "Kth Largest Element in a Stream", diff: "Easy", desc: "Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element." },
    { title: "Last Stone Weight", diff: "Easy", desc: "You are given an array of integers stones where stones[i] is the weight of the ith stone. We are playing a game with the stones. On each turn, we choose the heaviest two stones and smash them together." },
    { title: "K Closest Points to Origin", diff: "Medium", desc: "Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0)." },
    { title: "Kth Largest Element in an Array", diff: "Medium", desc: "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element." },
    { title: "Task Scheduler", diff: "Medium", desc: "Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. For each unit of time, the CPU could complete either one task or just be idle." },
    { title: "Design Twitter", diff: "Medium", desc: "Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the 10 most recent tweets in the user's news feed." },
    { title: "Find Median from Data Stream", diff: "Hard", desc: "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values. Implement the MedianFinder class." },
    { title: "Merge k Sorted Lists (Heap Version)", diff: "Hard", desc: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it." },
    { title: "Top K Frequent Elements", diff: "Medium", desc: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order." },
    { title: "Sort Characters By Frequency", diff: "Medium", desc: "Given a string s, sort it in decreasing order based on the frequency of the characters. The frequency of a character is the number of times it appears in the string." },
    { title: "Find K Pairs with Smallest Sums", diff: "Medium", desc: "You are given two integer arrays nums1 and nums2 sorted in non-decreasing order and an integer k. Define a pair (u, v) which consists of one element from the first array and one element from the second array. Return the k pairs (u1, v1), (u2, v2), ..., (uk, vk) with the smallest sums." },
    { title: "Cheapest Flights Within K Stops", diff: "Medium", desc: "There are n cities connected by some number of flights. You are given an array flights where flights[i] = [from_i, to_i, price_i] indicates that there is a flight from city from_i to city to_i with cost price_i. Return the cheapest price from src to dst with at most k stops." },
    { title: "Ugly Number II", diff: "Medium", desc: "An ugly number is a positive integer whose prime factors are limited to 2, 3, and 5. Given an integer n, return the nth ugly number." },
    { title: "Super Ugly Number", diff: "Medium", desc: "A super ugly number is a positive integer whose prime factors are in the array primes. Given an integer n and an array of integers primes, return the nth super ugly number." },
    { title: "Find Kth Smallest Pair Distance", diff: "Hard", desc: "The distance of a pair of integers a and b is defined as the absolute difference between a and b. Given an integer array nums and an integer k, return the kth smallest distance among all the pairs nums[i] and nums[j] where 0 <= i < j < nums.length." },
    { title: "Trapping Rain Water II", diff: "Hard", desc: "Given an m x n integer matrix heightMap representing the height of each unit cell in a 2D elevation map, return the volume of water it can trap after raining." },
    { title: "IPO", diff: "Hard", desc: "Suppose LeetCode will start its IPO soon. In order to sell a good price of its shares to Venture Capital, LeetCode would like to work on some projects to increase its capital before the IPO. Since it has limited resources, it can only finish at most k distinct projects before the IPO." },
    { title: "Maximum Performance of a Team", diff: "Hard", desc: "You are given two integers n and k and two integer arrays speed and efficiency both of length n. There are n engineers numbered from 1 to n. Return the maximum performance of a team of at most k engineers." },
    { title: "Smallest Range Covering Elements from K Lists", diff: "Hard", desc: "You have k lists of sorted integers in non-decreasing order. Find the smallest range that includes at least one number from each of the k lists." },
    { title: "Constrained Subsequence Sum", diff: "Hard", desc: "Given an integer array nums and an integer k, return the maximum sum of a non-empty subsequence of that array such that for every two consecutive integers in the subsequence, nums[i] and nums[j], where i < j, the condition j - i <= k is satisfied." },
    { title: "Furthest Building You Can Reach", diff: "Medium", desc: "You are given an integer array heights representing the heights of buildings, some bricks, and some ladders. You start your journey from building 0 and move to the next building by possibly using bricks or ladders. Return the furthest building index you can reach." },
    { title: "Construct Target Array With Multiple Sums", diff: "Hard", desc: "You are given an array target of n integers. From a starting array arr consisting of n 1's, you may perform the following procedure : let x be the sum of all elements currently in your array. Choose index i and set the value of arr at index i to x. Return true if it is possible to construct the target array from arr." },
    { title: "Minimum Number of Refueling Stops", diff: "Hard", desc: "A car travels from a starting position to a destination which is target miles east of the starting position. There are gas stations along the way. Return the minimum number of refueling stops the car must make in order to reach its destination." },
    { title: "Meeting Rooms III", diff: "Hard", desc: "You are given an integer n. There are n rooms numbered from 0 to n - 1. You are given a 2D integer array meetings where meetings[i] = [starti, endi] means that a meeting will be held during the half-closed time interval [starti, endi). Return the number of the room that held the most meetings." },
    { title: "Distant Barcodes", diff: "Medium", desc: "In a warehouse, there is a row of barcodes, where the ith barcode is barcodes[i]. Rearrange the barcodes so that no two adjacent barcodes are equal." }
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
  console.log('Batch 2 seed complete.');
}

main();
