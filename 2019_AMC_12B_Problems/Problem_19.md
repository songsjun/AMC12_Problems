# 2019 AMC 12B Problem 19

> This problem is the same as [2019 AMC 10B #22](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10B_Problems) and [2019 AMC 12B #19](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems).
## Problem
Raashan, Sylvia, and Ted play the following game. Each starts with  \$1. A bell rings every 15 seconds, at which time each of the players who currently have money simultaneously chooses one of the other two players independently and at random and gives \$1 to that player. What is the probability that after the bell has rung 2019 times, each player will have \$1? (For example, Raashan and Ted may each decide to give \$1 to Sylvia, and Sylvia may decide to give her dollar to Ted, at which point Raashan will have \$0, Sylvia will have \$2, and Ted will have \$1, and that is the end of the first round of play. In the second round Rashaan has no money to give, but Sylvia and Ted might choose each other to give their  \$1 to, and the holdings will be the same at the end of the second round.)

$\textbf{(A) } \frac{1}{7} \qquad\textbf{(B) } \frac{1}{4} \qquad\textbf{(C) } \frac{1}{3} \qquad\textbf{(D) } \frac{1}{2} \qquad\textbf{(E) } \frac{2}{3}$
## Solution 1
On the first turn, each player starts off with \$1. Each turn after that, there are only two possibilities: either everyone stays at \$1, which we will write as (1-1-1), or the distribution of money becomes \$2-\$1-\$0 in some order, which we write as (2-1-0). ((3-0-0) cannot be achieved since either(1)the person cannot give money to himself or (2)there are a maximum of 2 dollars being distributed and the person has nothing to start with). We will consider these two states separately.

In the (1-1-1) state, each person has two choices for whom to give their dollar to, meaning there are $2^3=8$ possible ways that the money can be rearranged. Note that there are only two ways that we can reach (1-1-1) again:

1. Raashan gives his money to Sylvia, who gives her money to Ted, who gives his money to Raashan.

2. Raashan gives his money to Ted, who gives his money to Sylvia, who gives her money to Raashan.

Thus, the probability of staying in the (1-1-1) state is $\frac{1}{4},$ while the probability of going to the (2-1-0) state is $\frac{3}{4} (w$e can check that the 6 other possibilities lead to (2-1-0)).

In the (2-1-0) state, we will label the person with \$2 as person A, the person with \$1 as person B, and the person with \$0 as person C. Person A has two options for whom to give money to, and person B has 2 options for whom to give money to, meaning there are total \cdot 2 = 4 ways the money can be redistributed. The only way that the distribution can return to (1-1-1) is if A gives \$1 to B, and B gives \$1 to C. We check the other possibilities to find that they all lead back to (2-1-0). Thus, the probability of going to the (1-1-1) state is \frac{1}{4}, while the probability of staying in the (2-1-0) state is \frac{3}{4}.

No matter which state we are in, the probability of going to the (1-1-1) state is always $\frac{1}{4}.$ This means that, after the bell rings 2018 times, regardless of what state the money distribution is in, there is a $\frac{1}{4}$ probability of going to the (1-1-1) state after the 2019th bell ring. Thus, our answer is simply $\boxed{\textbf{(B) } \frac{1}{4}}.$
## Solution 2 (Symmetry)
After the first ring, either nothing changes, or someone has \$2. No one can have \$3, since in that hypothetical round, that person would have to give away \$1. Thus, the outcome is either 1-1-1 or six symmetrical cases where one person gets \$2 (e.g. a 1-2-0 or 2-1-0 split).

**Case 1: Probability of returning to 1-1-1 from 1-1-1**

There are two ways for the three people to exchange dollars to get to the same 1-1-1 result. To see this, seat R, S, and T in a circle. Each person gives their dollar to either the person at left, or at right, to result in again 1 dollar for each person. There are 8 overall possibilities (since each person has 2 choices when giving away his or her dollar, therefore $2^3$ total possibilities). So, there is 1/4 chance of returning to 1-1-1.

**Case 2: Probability of returning to 1-1-1 from 2-1-0**

Without loss of generality, take the 2-1-0 case. Only 2 people can give money, so there are now $2^2=4$ possible outcomes after the bell rings. It either decomposes back into 1-1-1, 2-1-0 (remained unchanged), 2-0-1, 1-0-2. Thus, there is a 1/4 chance of returning to 1-1-1. Notice that this works for any of the 6 cases, as each is symmetrical to the others.

**Answer**

Since the starting state has a 1/4 chance of remaining unchanged, and each of the different 6 symmetric states all also have a 1/4 chance of reverting back to 1-1-1, the chance of it being 1-1-1 after any state is always $\boxed{\textbf{(B) } \frac{1}{4}}.$
## Solution 3
The two possible scenarios are they all have 1 dollar, or one person has 2 dollars, another has 1, and the last has none. We will consider the second scenario all to be the same no matter who has the 2 dollars, 1 dollar or 0 dollars from symmetry.

Let's consider all possible scenarios when the bell rings if they currently all have 1 dollar.
SRR -> 2, 1, 0
SRS -> 2, 1, 0
STR -> 1, 1, 1
STS -> 2, 1, 0
TRR -> 2, 1, 0
TRS -> 1, 1, 1
TTR -> 2, 1, 0
TTS -> 2, 1, 0
We see that $\frac{2}{8}$ or $\frac{1}{4}$ of the cases lead to them continuing to all of them having 1 dollar.
Now, let's consider all the possible scenarios when the bell rings if they currently have 2, 1, 0 dollars. Without loss of generality, let's say that R and S have 2 and 1 dollar respectively. (We can switch the names, our answer won't change).
SR -> 2, 1, 0
ST -> 1, 1, 1
TR -> 2, 1, 0
TT -> 2, 1, 0
We see that $\frac{1}{4}$ of the cases lead to them changing to all have 1 dollar.

So, no matter what was the scenario when the bell had been rung 2018 times, when the bell is rung the 2019th time, there is always a $\frac{1}{4}$ chance that it will turn into (or stay as) (1, 1, 1) :-)
## Solution 4 (Markov Chain)
Let the state (1-1-1) be A, and state (2-1-0) without considering the order be B. Similar to the previous 3 solutions, after a bell ring, the probability of state A staying in state A is $\frac{1}{4},$ that of state A transiting to state B is $\frac{3}{4},$ that of state B staying in state B is $\frac{3}{4},$ that of state B transiting to state A is $\frac{1}{4}.$ Using a [Markov Chain](https://artofproblemsolving.com/wiki/index.php/Markov_Chains), the state transition diagram is shown below.

[center|300px](https://artofproblemsolving.com/wiki/index.php/File:MarkovChain.png)


$$
\begin{align} P_A &= P_A \cdot \frac{1}{4} + P_B \cdot \frac{1}{4} \\ P_B &= P_A \cdot \frac{3}{4} + P_B \cdot \frac{3}{4} \\ &P_A + P_B = 1 \end{align}
$$


(1) and (2) are equivalent, from (1) or (2), we get $P_B = 3$P_A. Solving the system of equations, we get $P_A=\boxed{\textbf{(B) } \frac{1}{4}}$

**Note:** the number of bell rings doesn't matter, 2019 is redundant.

*~isabelchen*

**Note 2:** You can see that the number of bell rings doesn't matter through working state-by-state.

After 1 ring, the probability of state (1-1-1) is 1/4 and the probability of state (2-1-0) is 3/4.

Another iteration and you have the probability of state (1-1-1) to be

$$\frac14 \cdot (1-1-1)_1 + \frac14 \cdot (2-1-0)_1 = 1/4 \cdot 1/4 + 3/4 \cdot 1/4 = \frac14$$

and the probability of state (2-1-0) to be
$$3/4 \cdot 3/4 + 3/4 \cdot 1/4 = \frac34.$$

*~mathboy282*
## Solution 5 (Risky Guessing)
This works if one is short on time. Looking at how simple answer choices are, it seems like the number of bell rings is extra information (the other solutions show that this is true). So, we assume that the probability will be the same no matter how many times the bell rings, and we calculate it for 1 bell ring. Each person can give their dollar to 2 other people, so there are $2^3=8$ ways to switch up the money. Out of these 8 ways, 2! = 2 of them leave everyone with a dollar again, so our probability is $\tfrac{2}{8} = \boxed{\textbf{(B) } \frac{1}{4}}.$
## Video Solution by OmegaLearn
https://youtu.be/rLAcJe3o-uA?t=1086

*~pi_is_3.144*
## Video Solution
https://youtu.be/XT440PjAFmQ
## See Also
