export const initialWeeklyContest = {
  _id: "algo_weekly_42",
  id: "algo_weekly_42",
  title: "AlgoMate Weekly Contest #42",
  contestNumber: 42,
  isWeekly: true,
  description:
    "Curated challenge designed by top mentors to sharpen your problem-solving skills across LeetCode patterns, GFG algorithms, and real interview DSA problems.",
  mentorName: "Priya Sharma",
  mentorBio: "Staff Engineer @ Google · 8+ yrs CP & Interview Mentor",
  mentorAvatar:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  durationMinutes: 90,
  rewardCoins: 350,
  status: "active",
  difficulty: "Intermediate",
  problems: [
    {
      _id: "prob_lc_3",
      title: "Longest Substring Without Repeating Characters",
      source: "LeetCode",
      externalUrl:
        "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      difficulty: "Medium",
      points: 100,
      statement:
        "Given a string `s`, find the length of the longest substring without duplicate characters. Implement an optimal O(n) sliding window approach.",
      inputFormat: "A single string s",
      outputFormat: "Integer representing maximum substring length",
      constraints: "0 <= s.length <= 5 * 10^4",
      tags: ["Sliding Window", "Hash Map", "String"],
      testcases: [
        {
          input: "abcabcbb",
          output: "3",
          explanation: "The answer is 'abc', with length 3.",
        },
        {
          input: "bbbbb",
          output: "1",
          explanation: "The answer is 'b', with length 1.",
        },
        {
          input: "pwwkew",
          output: "3",
          explanation: "The answer is 'wke', with length 3.",
        },
      ],
      mentorHint:
        "Maintain the last seen index of each character with a hashmap or frequency array to slide the left window pointer dynamically.",
    },
    {
      _id: "prob_gfg_cycle",
      title: "Detect Cycle in an Undirected Graph",
      source: "GeeksForGeeks",
      externalUrl:
        "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
      difficulty: "Medium",
      points: 150,
      statement:
        "Given an undirected graph with V vertices and E edges, determine whether the graph contains a cycle or not using BFS or DFS traversal.",
      inputFormat: "V and E followed by edge pairs (u, v)",
      outputFormat: "1 if cycle exists, 0 otherwise",
      constraints: "1 <= V, E <= 10^5",
      tags: ["Graph", "BFS", "DFS", "Disjoint Set"],
      testcases: [
        {
          input: "5 5\n0 1\n1 2\n2 3\n3 4\n4 1",
          output: "1",
          explanation: "Edges 1-2-3-4-1 form a cycle.",
        },
        {
          input: "4 3\n0 1\n1 2\n2 3",
          output: "0",
          explanation: "The graph is a tree without cycles.",
        },
      ],
      mentorHint:
        "In an undirected graph, an edge to an already-visited node that is NOT the immediate parent indicates a back-edge, hence a cycle.",
    },
    {
      _id: "prob_mentor_xor",
      title: "Maximum XOR Subarray with Bounded Window (Mentor's Special)",
      source: "AlgoMate",
      externalUrl: "",
      difficulty: "Hard",
      points: 200,
      statement:
        "Given an array of integers arr[] and an integer K, find the maximum XOR sum of any contiguous subarray of size at most K. This problem was designed by Mentor Priya to test advanced Trie and Prefix-XOR mastery.",
      inputFormat: "Array length N, maximum size K, followed by N integers",
      outputFormat: "Maximum XOR sum value",
      constraints: "1 <= K <= N <= 10^5, 0 <= arr[i] <= 10^9",
      tags: ["Trie", "Bit Manipulation", "Sliding Window"],
      testcases: [
        {
          input: "4 2\n1 2 3 4",
          output: "7",
          explanation: "Subarray [3, 4] gives 3 XOR 4 = 7.",
        },
        {
          input: "5 3\n8 1 2 12 1",
          output: "15",
          explanation: "Subarray [2, 12, 1] gives 2^12^1 = 15.",
        },
      ],
      mentorHint:
        "Maintain a sliding Trie storing prefix XORs for the sliding window of size at most K.",
    },
  ],
  leaderboard: [
    {
      userId: "u1",
      userName: "Aman Verma",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aman",
      score: 450,
      problemsSolved: 3,
      finishTimeMinutes: 48,
      rank: 1,
    },
    {
      userId: "u2",
      userName: "Rohan Patel",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan",
      score: 350,
      problemsSolved: 2,
      finishTimeMinutes: 52,
      rank: 2,
    },
    {
      userId: "u3",
      userName: "Sneha Mukherjee",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha",
      score: 250,
      problemsSolved: 2,
      finishTimeMinutes: 65,
      rank: 3,
    },
    {
      userId: "u4",
      userName: "Karthik Nair",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Karthik",
      score: 100,
      problemsSolved: 1,
      finishTimeMinutes: 30,
      rank: 4,
    },
  ],
};

export const sampleContestsList = [
  initialWeeklyContest,
  {
    _id: "algo_weekly_41",
    id: "algo_weekly_41",
    title: "AlgoMate Weekly Contest #41",
    contestNumber: 41,
    isWeekly: true,
    description: "Previous week's Dynamic Programming & Tree traversal battle.",
    mentorName: "David Miller",
    mentorBio: "Principal Engineer @ Meta · Graph & DP Specialist",
    mentorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    startTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    rewardCoins: 300,
    status: "completed",
    difficulty: "Advanced",
    problems: [
      {
        _id: "prob_lc_coin",
        title: "Coin Change (LeetCode #322)",
        source: "LeetCode",
        externalUrl: "https://leetcode.com/problems/coin-change/",
        difficulty: "Medium",
        points: 100,
        statement:
          "Compute the fewest number of coins that you need to make up that amount.",
        testcases: [{ input: "[1,2,5] 11", output: "3" }],
      },
      {
        _id: "prob_gfg_lcs",
        title: "Longest Common Subsequence",
        source: "GeeksForGeeks",
        externalUrl:
          "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1",
        difficulty: "Medium",
        points: 150,
        statement: "Find the length of the longest common subsequence.",
        testcases: [{ input: "ABCDGH AEDFHR", output: "3" }],
      },
    ],
    leaderboard: [
      {
        userId: "u10",
        userName: "Dev Sharma",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Dev",
        score: 250,
        problemsSolved: 2,
        finishTimeMinutes: 44,
        rank: 1,
      },
    ],
  },
];
