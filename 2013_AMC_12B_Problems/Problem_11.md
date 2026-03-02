# 2013 AMC 12B Problem 11

## Problem
Two bees start at the same spot and fly at the same rate in the following directions. Bee A travels 1 foot north, then 1 foot east, then 1 foot upwards, and then continues to repeat this pattern. Bee B travels 1 foot south, then 1 foot west, and then continues to repeat this pattern. In what directions are the bees traveling when they are exactly 10 feet away from each other?

$\textbf{(A) } A\ \text{east, } B\ \text{west} \qquad \textbf{(B) } A\ \text{north, } B\ \text{south} \qquad \textbf{(C) } A\ \text{north, } B\ \text{west} \qquad \textbf{(D) } A\ \text{up, } B\ \text{south} \qquad \textbf{(E) } A\ \text{up, } B\ \text{west}$
## Solution
Let A and B begin at (0,0,0). In 6 steps, A will have done his route twice, ending up at (2,2,2), and B will have done his route three times, ending at (-3,-3,0). Their distance is $\sqrt{(2+3)^2+(2+3)^2+2^2}=\sqrt{54} < 10.$ We now move forward one step at a time until they are ten feet away:

7 steps: A moves north to (2,3,2), B moves south to (-3,-4,0), distance of $\sqrt{(2+3)^2+(3+4)^2+2^2}=\sqrt{78} < 10$

8 steps: A moves east to (3,3,2), B moves west to (-4,-4,0), distance of $\sqrt{(3+4)^2+(3+4)^2+2^2}=\sqrt{102}>10$

Thus they reach 10 feet away when A is moving east and B is moving west, between moves 7 and 8. Thus the answer is  $\boxed{\textbf{(A)}}.$
## See Also
