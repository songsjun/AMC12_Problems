# 2017 AMC 12A Problem 14

## Problem
Alice refuses to sit next to either Bob or Carla. Derek refuses to sit next to Eric. How many ways are there for the five of them to sit in a row of 5 chairs under these conditions?

$\textbf{(A)}\ 12 \qquad \textbf{(B)}\ 16 \qquad\textbf{(C)}\ 28 \qquad\textbf{(D)}\ 32 \qquad\textbf{(E)}\ 40$
## Solution
Alice may sit in the center chair, in an end chair, or in a next-to-end chair. Suppose she sits in the center chair. The 2nd and 4th chairs (next to her) must be occupied by Derek and Eric, in either order, leaving the end chairs for Bob and Carla in either order; this yields 2! * 2! = 4 ways to seat the group.

Next, suppose Alice sits in one of the end chairs. Then the chair beside her will be occupied by either Derek or Eric. The center chair must be occupied by Bob or Carla, leaving the last two people to fill the last two chairs in either order. 2 ways to seat Alice times 2 ways to fill the next chair times 2 ways to fill the center chair times 2 ways to fill the last two chairs yields 2 * 2 * 2 * 2 = 16 ways to fill the chairs.

Finally, suppose Alice sits in the second or fourth chair. Then the chairs next to her must be occupied by Derek and Eric in either order, and the other two chairs must be occupied by Bob and Carla in either order. This yields 2 * 2 * 2 = 8 ways to fill the chairs.

In total, there are 4 + 8 + 16 ways to fill the chairs, so the answer is $\boxed{\bold{(C)}\ 28}.$
## See Also
